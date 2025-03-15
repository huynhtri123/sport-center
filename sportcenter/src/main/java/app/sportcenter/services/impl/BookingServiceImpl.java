package app.sportcenter.services.impl;

import app.sportcenter.commons.*;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.request.BookingRequest;
import app.sportcenter.models.dto.request.InvoiceRequest;
import app.sportcenter.models.dto.request.RecurringBookingRequest;
import app.sportcenter.models.dto.response.*;
import app.sportcenter.models.entities.*;
import app.sportcenter.repositories.*;
import app.sportcenter.services.BookingService;
import app.sportcenter.services.InvoiceService;
import app.sportcenter.services.UserService;
import app.sportcenter.utils.kafkaUsage.MessageWrapper;
import app.sportcenter.utils.mappers.BookingMapper;
import app.sportcenter.utils.mappers.FieldMapper;
import app.sportcenter.utils.mappers.RecurringBookingMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.ZonedDateTime;
import java.util.*;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final RecurringBookingRepository recurringBookingRepository;
    private final RecurringBookingMapper recurringBookingMapper;
    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final InvoiceService invoiceService;
    private final FieldMapper fieldMapper;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // đặt lẻ bước 1
    @Transactional
    @Override
    public BookingResponse createBooking(BookingRequest bookingRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Field field = fieldRepository.findById(bookingRequest.getFieldId())
                .orElseThrow(() -> new CustomException("Field with this ID not found.", HttpStatus.NOT_FOUND.value()));
        log.info("Booking user: " + currentUser.getFullName());
        log.info("Booking field: " + field.getFieldName());

        // tính toán thời gian kết thúc dựa trên số giờ đặt
        // vì theo quy ước converter đã cấu hình thì đầu vào mongo sẽ phải là +0,
        // nên đầu vào ta dùng giờ VN nhưng định dạng +0,
        // do đó cần trừ đi 7 múi để lưu vào db chính xác, khi get ra thì sẽ là +7 là vừa
        ZonedDateTime startTime = bookingRequest.getStartTime().minusHours(7);
        ZonedDateTime endTime = startTime.plusHours(bookingRequest.getNumberOfHours());

        boolean isAvailableField = checkAvailableField(field.getId(), startTime, endTime);
        // nếu có nghĩa là kẹt lịch, out
        if (isAvailableField) {
            // tạo ra các timeSlot AVAILABLE cho khoảng tgian đặt (ví dụ 7-9h -> tạo 2 timeSlot AVAILABLE)
            field.createTimeSlots(startTime, endTime);

            // đổi trạng thái của các TimeSlot liên quan đến booking thành IN_USE
            for (TimeSlot slot : field.getTimeSlots()) {
                if (slot.getStartTime().isBefore(endTime) &&
                        slot.getEndTime().isAfter(startTime)) {
                    slot.setStatus(FieldStatus.IN_USE);
                }
            }

            fieldRepository.save(field);

            // Tạo booking mới với trạng thái sân đã được cập nhật
            bookingRequest.setStartTime(startTime);
            Booking booking = bookingMapper.convertToEntity(bookingRequest, field, currentUser);
            booking.setRecurring(false);        // single booking
            booking.setIsActive(true);
            booking.setProcessing(true);        // wait thanh toan
            booking.setTotalPrice(getBookingPrice(bookingRequest));
            Booking savedBooking = bookingRepository.save(booking);

            BookingResponse response = bookingMapper.convertToResponse(savedBooking);

            log.info("Đặt sân bước 1 thành công {}", response.getId());
            return response;
        }

        throw new CustomException("Failed! The field is not available at this time!", HttpStatus.CONFLICT.value());
    }

    // kiểm tra xem trong khoảng thời gian nhất định, sân đó có trống không
    private boolean checkAvailableField(String fieldId, ZonedDateTime startTime, ZonedDateTime endTime) {
        // tìm danh sách booking có timeSlots có trạng thái IN_USE trong khoảng thời gian này
        // nếu sân trống thì list này = 0
        List<Booking> inUseBookingList = bookingRepository.findInUseTimeSlotsByFieldAndTimeRange(fieldId,
                startTime, endTime);
        return inUseBookingList.isEmpty();
    }

    // đặt lẻ bước 2: xác nhận
    @Override
    public BookingResponse confirmBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking to confirm not found."));

        // kiem tra quyen
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) authentication.getPrincipal();
        if (!currUser.getId().equals(booking.getUser().getId()) && !currUser.getRole().equals(Role.ADMIN)) {
            throw new CustomException("You do not have permission to confirm this booking.", HttpStatus.BAD_REQUEST.value());
        }

        // kiểm tra coi booking này có thật sự cần được xác nhận không (dang xu ly va chưa bị xoa)
        if (!booking.isProcessing() || booking.getIsDeleted()) {
            throw new CustomException("Oops! Your booking request has expired. Please try again!", HttpStatus.BAD_REQUEST.value());
        }

        // ok -> thực hiện xác nhận
        booking.setProcessing(false);   // danh dau la xu ly xong

        Booking activeBooking = bookingRepository.save(booking);
        BookingResponse response = bookingMapper.convertToResponse(activeBooking);
        log.info("Đặt sân bước 2 thành công! {}", bookingId);

        // send mail
        MessageWrapper messageWrapper = MessageWrapper.builder()
                .type(SendMailType.CONFIRM_BOOKING.name())
                .payload(response)
                .toEmail(currUser.getEmail())
                .toFullName(currUser.getFullName())
                .build();
        kafkaTemplate.send("booking-notification-delivery", messageWrapper);

        return response;
    }

    // đặt cứng bước 1
    @Transactional
    @Override
    public RecurringBookingResponse createRecurringBooking(RecurringBookingRequest recurringBookingRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Field field = fieldRepository.findById(recurringBookingRequest.getFieldId())
                .orElseThrow(() -> new NotFoundException("Field with this ID not found."));
        log.info("RecurringBooking user: {}", currentUser.getFullName());
        log.info("RecurringBooking field: {}", field.getFieldName());

        RecurringBooking recurringBooking = recurringBookingMapper.convertToEntity(recurringBookingRequest, field, currentUser);
        recurringBooking.setStartDate(recurringBooking.getStartDate().minusHours(7));
        recurringBooking.setStartTime(recurringBooking.getStartTime().minusHours(7));

        List<TimeSlot> recurringTimeSlots = recurringBooking.generateTimeSlots();
        boolean isAvailableRecurring = checkAvailableRecurring(field.getId(), recurringTimeSlots);
        if (!isAvailableRecurring) {
            throw new CustomException("Failed! There is at least 1 timeslot that is not available during this time in the future.",
                    HttpStatus.CONFLICT.value());
        }

        // thoát ra đây được nghĩa là toàn bộ timeSLot 'sẽ chiếm' đều trống trong tương lai
        // => Tạo các bookings ứng với tất cả timeSLot đó
        String fieldId = field.getId();
        int numberOfHours = recurringBooking.getNumberOfHours();
        List<Booking> bookingsToSave = new ArrayList<>();   // để chút lưu vào db 1 lượt cho đỡ tốn
        for (TimeSlot timeSlot : recurringTimeSlots) {
            // tạo:
            BookingRequest bookingRequest = new BookingRequest(fieldId, timeSlot.getStartTime(), numberOfHours);
            ZonedDateTime startTime = bookingRequest.getStartTime();
            ZonedDateTime endTime = startTime.plusHours(bookingRequest.getNumberOfHours());

            // tạo ra các timeSlot AVAILABLE cho khoảng tgian đặt (ví dụ 7-9h -> tạo 2 timeSlot AVAILABLE
            field.createTimeSlots(startTime, endTime);

            // Đổi trạng thái của các TimeSlot liên quan đến booking thành IN_USE
            for (TimeSlot slot : field.getTimeSlots()) {
                if (slot.getStartTime().isBefore(endTime) &&
                        slot.getEndTime().isAfter(startTime)) {
                    slot.setStatus(FieldStatus.IN_USE);

                }
            }

            Booking booking = bookingMapper.convertToEntity(bookingRequest, field, currentUser);
            booking.setRecurring(true);         // recurring booking
            booking.setIsActive(true);
            booking.setProcessing(true);        // wait thanh toan
            bookingsToSave.add((booking));
        }
        fieldRepository.save(field);
        bookingRepository.saveAll(bookingsToSave);
        recurringBooking.setBookingIds(bookingsToSave.stream().map(Booking::getId).collect(Collectors.toList()));
        recurringBooking.setTotalPrice(getRecurringBookingPrice(recurringBookingRequest));
        recurringBooking.setTimeSlots(recurringTimeSlots);
        recurringBooking.setIsActive(true);
        recurringBooking.setProcessing(true);   // wait thanh toan

        RecurringBooking savedRecurringBooking = recurringBookingRepository.save(recurringBooking);
        RecurringBookingResponse response = recurringBookingMapper.convertToDTO(savedRecurringBooking);

        log.info("Đặt sân (recurring) bước 1 thành công {}", response.getId());
        return response;

    }

    @Override
    public List<TimeSlot> getTimeSlotsForRecurring(RecurringBookingRequest recurringBookingRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Field field = fieldRepository.findById(recurringBookingRequest.getFieldId())
                .orElseThrow(() -> new NotFoundException("Field with this ID not found."));

        RecurringBooking recurringBooking = recurringBookingMapper.convertToEntity(recurringBookingRequest, field, currentUser);
        List<TimeSlot> recurringTimeSlots = recurringBooking.generateTimeSlots();

        // Chuyển múi giờ từ UTC sang GMT+7
        ZoneId targetZone = ZoneId.of("Asia/Bangkok");
        List<TimeSlot> convertedTimeSlots = recurringTimeSlots.stream().map(slot -> {
            ZonedDateTime start = slot.getStartTime().withZoneSameInstant(targetZone);
            ZonedDateTime end = slot.getEndTime().withZoneSameInstant(targetZone);
            return new TimeSlot(start, end, FieldStatus.IN_USE);
        }).collect(Collectors.toList());

        log.info("Converted Time Slots: {}", convertedTimeSlots);
        return convertedTimeSlots;
    }


    private boolean checkAvailableRecurring(String fieldId, List<TimeSlot> recurringTimeSlots) {
        for (TimeSlot timeSlot : recurringTimeSlots) {
            // tìm danh sách booking có timeSlots có trạng thái IN_USE trong khoảng thời gian này
            // nếu sân trống thì list này = 0
            List<Booking> inUseBookingList = bookingRepository.findInUseTimeSlotsByFieldAndTimeRange(fieldId,
                    timeSlot.getStartTime(), timeSlot.getEndTime());
            if (!inUseBookingList.isEmpty()) {
                return false;
            }
        }
        return true;
    }

    // đặt cứng bước 2: xác nhận
    @Override
    public RecurringBookingResponse confirmRecurringBooking(String recurringId) {
        // lấy thông tin RecurringBooking
        RecurringBooking recurringBooking = recurringBookingRepository.findById(recurringId)
                .orElseThrow(() -> new NotFoundException("RecurringBooking with this ID not found."));
        List<Booking> relatedBookings = bookingRepository.findAllById(recurringBooking.getBookingIds());

        // kiểm tra quyền thực hiện
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) authentication.getPrincipal();
        if (!currUser.getId().equals(recurringBooking.getUser().getId()) && !currUser.getRole().equals(Role.ADMIN)) {
            throw new CustomException("You do not have permission to confirm this recurring booking.", HttpStatus.BAD_REQUEST.value());
        }

        // kiểm tra trạng thái recurring (chi khi isProcessinng & delete=false moi can xac nhan)
        if (!recurringBooking.isProcessing() || recurringBooking.getIsDeleted()) {
            throw new CustomException("Oops! Your booking request has expired. Please try again!", HttpStatus.BAD_REQUEST.value());
        }

        // ok -> có thể xác nhận recurring
        for (Booking booking : relatedBookings) {
            booking.setProcessing(false);       // danh dau la hoan tat
        }
        recurringBooking.setIsActive(true);     // danh dau la hoan tat
        recurringBooking.setProcessing(false);  // danh dau la hoan tat

        bookingRepository.saveAll(relatedBookings);
        RecurringBooking confirmedRecurring = recurringBookingRepository.save(recurringBooking);
        RecurringBookingResponse response = recurringBookingMapper.convertToDTO(confirmedRecurring);

        // send mail
        MessageWrapper messageWrapper = MessageWrapper.builder()
                .type(SendMailType.CONFIRM_RECURRING.name())
                .payload(response)
                .toEmail(currUser.getEmail())
                .toFullName(currUser.getFullName())
                .build();
        kafkaTemplate.send("recurring-notification-delivery", messageWrapper);

        log.info("Đặt sân (recurring) bước 2 thành công,{}", recurringId);
        return response;
    }

    @Override
    public Double getBookingPrice(BookingRequest bookingRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Field field = fieldRepository.findById(bookingRequest.getFieldId())
                .orElseThrow(() -> new NotFoundException("Field with this ID not found."));
        Booking booking = bookingMapper.convertToEntity(bookingRequest, field, currentUser);

        return booking.getPrice();
    }

    @Override
    public Double getRecurringBookingPrice(RecurringBookingRequest recurringBookingRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Field field = fieldRepository.findById(recurringBookingRequest.getFieldId())
                .orElseThrow(() -> new NotFoundException("Field with this ID not found."));
        RecurringBooking recurringBooking = recurringBookingMapper.convertToEntity(recurringBookingRequest, field, currentUser);

        getTimeSlotsForRecurring(recurringBookingRequest);

        int packageDurationMonths = recurringBookingRequest.getPackageDurationMonths();
        // giam gia cho recurring
        return recurringBooking.getPrice() * discountRateByDurationMonths(packageDurationMonths);
    }

    @Override
    public ResponseEntity<BaseResponse> getRecurringBookingByContainBookingId(String bookingId) {
        RecurringBooking recurringBooking = recurringBookingRepository.getByContainBookingId(bookingId);
        if (recurringBooking == null) {
            throw new NotFoundException("No recurring booking found with this bookingId:: " + bookingId);
        }
        RecurringBookingResponse response = recurringBookingMapper.convertToDTO(recurringBooking);
        return ResponseEntity.ok(
                new BaseResponse("RecurringBooking found.", HttpStatus.OK.value(), response)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new CustomException("RecurringBooking cannot found!", HttpStatus.NOT_FOUND.value()));

        BookingResponse response = bookingMapper.convertToResponse(booking);

        return ResponseEntity.ok(
                new BaseResponse("RecurringBooking found.", HttpStatus.OK.value(), response)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getBookingByUserId(String userId) {
        List<Booking> bookingList = bookingRepository.findBookingByUserId(userId);
        if (bookingList.isEmpty()) {
            throw new CustomException("No bookings found for this user!", HttpStatus.NOT_FOUND.value());
        }

        List<BookingResponse> responseList = bookingList.stream().map(bookingMapper::convertToResponse).toList();
        return ResponseEntity.ok(
                new BaseResponse("Found the booking list for this user.", HttpStatus.OK.value(), responseList)
        );
    }

//    @Override
//    public ResponseEntity<BaseResponse> getCurrentBookingsOfCurrentUser(String userId) {
//        // Lấy thông tin người dùng hiện tại từ SecurityContext
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        User currentUser = (User) authentication.getPrincipal();
//        String currentUserId = currentUser.getId();
//        log.info("Current user for get my bookings: " + currentUserId);
//
//        // Kiểm tra xem userId truyền vào có trùng với userId trong JWT hay không
//        if (!currentUserId.equals(userId)) {
//            throw new CustomException("You do not have permission to access other users' bookings.", HttpStatus.FORBIDDEN.value());
//        }
//
//        ZonedDateTime now = ZonedDateTime.now();
//        // lấy danh sách booking của user hiện tại, còn hiệu lực
//        List<Booking> bookingList = bookingRepository.getCurrentBookingsOfCurrentUser(userId, now, FieldStatus.IN_USE.name());
//        if (bookingList.isEmpty()) {
//            throw new CustomException("You don't have any bookings yet!", HttpStatus.NOT_FOUND.value());
//        }
//
//        List<BookingResponse> responseList = bookingList.stream().map(bookingMapper::convertToResponse).toList();
//        return ResponseEntity.ok(
//                new BaseResponse("Found the booking list.", HttpStatus.OK.value(), responseList)
//        );
//    }

    @Override
    public ResponseEntity<BaseResponse> getCurrentBookingsOfCurrentUser(Integer year) {
        // Lấy thông tin người dùng hiện tại từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        if (currentUser == null) {
            throw new NotFoundException("User currently logged in not found!");
        }

        String currentUserId = currentUser.getId();
        log.info("Current user for get my bookings: " + currentUserId);

        // Nếu người dùng không nhập năm, mặc định lấy năm hiện tại
        int targetYear = (year == null) ? LocalDate.now().getYear() : year;

        ZonedDateTime startOfYear = ZonedDateTime.of(targetYear, 1, 1, 0, 0, 0, 0, ZoneId.systemDefault());
        ZonedDateTime endOfYear = ZonedDateTime.of(targetYear, 12, 31, 23, 59, 59, 999999999, ZoneId.systemDefault());

        // Lấy danh sách booking của user trong năm đó
        List<Booking> bookingList = bookingRepository.findBookingsByUserIdAndYear(currentUserId, startOfYear, endOfYear);

        if (bookingList.isEmpty()) {
            return ResponseEntity.ok(
                    new BaseResponse("No bookings found for the current user in " + targetYear, HttpStatus.OK.value(), new ArrayList<>())
            );
        }

        List<BookingResponse> responseList = bookingList.stream()
                .map(bookingMapper::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new BaseResponse("Found bookings for the current user in " + targetYear, HttpStatus.OK.value(), responseList)
        );
    }


    @Override
    public ResponseEntity<BaseResponse> getBookingByFieldId(String fieldId) {
        List<Booking> bookingList = bookingRepository.getBookingByFieldId(fieldId);
        if (bookingList.isEmpty()) {
            throw new CustomException("No bookings found for this field!", HttpStatus.NOT_FOUND.value());
        }

        List<BookingResponse> responseList = bookingList.stream().map(bookingMapper::convertToResponse).toList();
        return ResponseEntity.ok(
                new BaseResponse("Found the booking list for this field.", HttpStatus.OK.value(), responseList)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getBookingsByStartTime(ZonedDateTime startTime) {
        List<Booking> bookingList = bookingRepository.getBookingByStartTime(startTime);
        if (bookingList.isEmpty()) {
            throw new CustomException("No bookings found for this court!", HttpStatus.NOT_FOUND.value());
        }

        List<BookingResponse> responseList = bookingList.stream().map(bookingMapper::convertToResponse).toList();
        return ResponseEntity.ok(
                new BaseResponse("Found the booking list for this court.", HttpStatus.OK.value(), responseList)
        );
    }


    @Transactional
    @Override
    public ResponseEntity<BaseResponse> getAllBookings(int page, int size) {
        Page<Booking> bookingPage = bookingRepository.findAllActive(PageRequest.of(page, size));

        if (bookingPage.isEmpty()) {
            throw new CustomException("No active bookings found!", HttpStatus.NOT_FOUND.value());
        }

        List<BookingResponse> responseList = bookingPage.getContent().stream()
                .map(bookingMapper::convertToResponse)
                .toList();

        PaginatedResponse<BookingResponse> paginatedResponse = new PaginatedResponse<>(
                responseList,
                bookingPage.getTotalPages(),
                bookingPage.getTotalElements()
        );

        return ResponseEntity.ok(
                new BaseResponse("Found the list of active bookings.", HttpStatus.OK.value(), paginatedResponse)
        );
    }

    // 1. tạo ra (18) timeSLot AVAILABLE trải dài nguyên ngày,
    // 2. duyệt "bookings" của field đó trong ngày đo nếu có thì
    // hàm update sẽ kiểm tra để đổi trạng thái những timeSLot đã bị đặt thành in use,
    // nếu không thì 18 slot đó vẫn là AVAILABLE
    @Transactional
    @Override
    public ResponseEntity<BaseResponse> getFieldSchedule(String fieldId, ZonedDateTime startOfDay, ZonedDateTime endOfDay) {
        // 1. Lấy tất cả các booking của sân trong khoảng thời gian
        List<Booking> bookings = bookingRepository.findBookingsByFieldAndTimeRange(fieldId, startOfDay, endOfDay);

        // 2. Lấy thông tin của sân
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new CustomException("Field not found", HttpStatus.NOT_FOUND.value()));

        // tạo list timeSlots trải dài suốt khoảng thời gian này
        field.createTimeSlots(startOfDay, endOfDay);
        // cập nhật trạng thái timeSlots của sân theo các booking đã lấy
        field.updateTimeSlotsStatus(bookings);
        Field updatedField = fieldRepository.save(field);

        FieldResponse fieldResponse = fieldMapper.convertToDTO(updatedField);
        // lấy từ DB (+0) ra thì +thêm 7 múi để thành giờ VN
        fieldResponse.convertTimeSlotsToUTCPlus7();

        return ResponseEntity.ok(
                new BaseResponse("Successfully retrieved the court schedule.", HttpStatus.OK.value(), fieldResponse));
    }


    @Transactional
    @Override
    public ResponseEntity<BaseResponse> changeIsDeleted(String bookingId, boolean flag) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("No booking found!", HttpStatus.NOT_FOUND.value()));
        booking.setIsDeleted(flag);
        Booking savedBooking = bookingRepository.save(booking);

        BookingResponse response = bookingMapper.convertToResponse(savedBooking);
        String message = "Success. Current status: isDeleted=" + booking.getIsDeleted();

        return ResponseEntity.ok(
                new BaseResponse(message, HttpStatus.OK.value(), response)
        );
    }
    @Transactional
    @Override
    public ResponseEntity<BaseResponse> forceDelete(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Booking not found!", HttpStatus.NOT_FOUND.value()));
        BookingResponse response = bookingMapper.convertToResponse(booking);

        bookingRepository.deleteById(bookingId);
        return ResponseEntity.ok(
                new BaseResponse("Force delete booking successful.", HttpStatus.OK.value(), response)
        );
    }

    @Override
    public BookingResponse cancelBooking(String bookingId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("This booking not found."));

        // check xem Booking co dang xu ly (chua thanh toan xong) khong
        if (booking.isProcessing()) {
            throw new CustomException("This booking is processing (expired after 5p), you cannot cancel it!", 400);
        }

        // chỉ chủ sỡ hữu hoặc admin mới có quyền huỷ booking
        if (booking.getUser().getId().equals(currentUser.getId()) || currentUser.getRole().equals(Role.ADMIN)) {
            Field field = booking.getField();
            if (field == null) {
                throw new NotFoundException("Field not found in this booking.");
            }
            ZonedDateTime bookingStartTime = booking.getStartTime();
            ZonedDateTime bookingEndTime = booking.getEndTime();

            ZonedDateTime now = ZonedDateTime.now();

            // kiểm tra nếu booking đã hết hạn thì out
            if (bookingEndTime.isBefore(now) || !booking.getIsActive() || booking.getIsDeleted()) {
                throw new CustomException("This booking has expired and cannot be canceled!", HttpStatus.BAD_REQUEST.value());
            }

            // 1. tạo timeSlot AVAILABLE trong khoảng thời gian này
            field.createTimeSlots(bookingStartTime, bookingEndTime);
            fieldRepository.save(field);

            // 2. huỷ -> tắt isActive. bật isDeleted
            booking.setField(field);
            booking.setIsActive(false);
            booking.setIsDeleted(true);
            Booking canceledBooking = bookingRepository.save(booking);

            BookingResponse response = bookingMapper.convertToResponse(canceledBooking);
            log.info("Canceled booking " + canceledBooking.getId());

            // 3. hoàn tiền nếu là đặt lẻ
            User owner = userRepository.findById(booking.getUser().getId())
                    .orElseThrow(() -> new NotFoundException("Owner of this booking not found."));
            if (!booking.isRecurring()) {
                Double refundAmount = booking.getPrice();
                userService.refund(owner, refundAmount);
                // tạo hoá đơn
                InvoiceRequest invoiceRequest = new InvoiceRequest();
                invoiceRequest.setUserId(owner.getId());
                invoiceRequest.setAmount(refundAmount);
                invoiceRequest.setPaymentMethod(PaymentMethod.ACCOUNT_BALANCE);
                invoiceRequest.setPaymentStatus(PaymentStatus.PAID);
                invoiceRequest.setTransactionType(TransactionType.REFUND);
                InvoiceResponse invoiceResponse = invoiceService.create(invoiceRequest);
            }

            // 4. send mail
            MessageWrapper messageWrapper = MessageWrapper.builder()
                    .type(SendMailType.CANCEL_BOOKING.name())
                    .payload(response)
                    .toEmail(owner.getEmail())
                    .toFullName(owner.getFullName())
                    .build();
            kafkaTemplate.send("cancel-booking-notification-delivery", messageWrapper);

            return response;

        } else {
            throw new CustomException("You do not have permission to cancel another user's court booking.", HttpStatus.FORBIDDEN.value());
        }

    }

    private List<Booking> getRelevantActiveBookings(String bookingId) {
        RecurringBooking recurrParent = recurringBookingRepository.getByContainBookingId(bookingId);
        if (recurrParent == null) {
            throw new CustomException("This booking has expired and cannot be canceled!", 400);
        }
        // xác thực
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) auth.getPrincipal();
        if (currUser.getRole() != Role.ADMIN && !currUser.getId().equals(recurrParent.getUser().getId())) {
            throw new CustomException("You do not have permission to access another user's recurring bookings!", HttpStatus.FORBIDDEN.value());
        }
        return recurrParent.getBookingIds()
                .stream()
                .map(id -> bookingRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .filter(booking -> booking.getIsActive() && !booking.getIsDeleted())
                .toList();
    }

    @Override
    public Double getRemainingAmountOfRecurringByBookingId(String bookingId) {
        Double remainingAmount = 0.0;
        // 1. tìm bookings liên quan
        List<Booking> relevantBooking = getRelevantActiveBookings(bookingId);
        if (!relevantBooking.isEmpty()) {
            for (Booking booking : relevantBooking) {
                // lấy tổng giá tiền của những booking còn hiệu lực
                if (booking.getIsActive() && !booking.getIsDeleted()) {
                    Double bookingPrice = booking.getPrice();
                    //log.error("gia booking le trong cung: " + bookingPrice);
                    remainingAmount += bookingPrice;
                }
            }
        }
        return remainingAmount;
    }

    @Transactional
    @Override
    public RecurringBookingResponse cancelRecurringByBookingId(String bookingId) {
        RecurringBooking recurrParent = recurringBookingRepository.getByContainBookingId(bookingId);
        if (recurrParent == null) {
            throw new CustomException("This booking has expired and cannot be canceled!", 400);
        }

        if (recurrParent.isProcessing()) {
            throw new CustomException("This booking is processing (expired after 5p), you cannot cancel it!", 400);
        }

        Double remainingAmount = 0.0;

        // cancel
        // 1. xử lý bookings liên quan
        List<Booking> relevantBooking = getRelevantActiveBookings(bookingId);
        List<Field> fieldsToSave = new ArrayList<>();
        List<Booking> bookingsToSave = new ArrayList<>();
        if (!relevantBooking.isEmpty()) {
            for (Booking booking : relevantBooking) {
                // lấy tổng giá tiền của những booking còn hiệu lực
                if (booking.getIsActive() && !booking.getIsDeleted()) {
                    Double bookingPrice = booking.getPrice();
                    //log.error("gia booking le trong cung: " + bookingPrice);
                    remainingAmount += bookingPrice;
                }
                ZonedDateTime startTime = booking.getStartTime();
                ZonedDateTime endTime = booking.getEndTime();
                Field field = booking.getField();

                field.createTimeSlots(startTime, endTime);  // reset fields status -> AVAILABLE
                booking.setIsActive(false);                 // tắt hoạt động
                booking.setIsDeleted(true);
                fieldsToSave.add(field);
                bookingsToSave.add(booking);
            }
            fieldRepository.saveAll(fieldsToSave);
            bookingRepository.saveAll(bookingsToSave);
        }
        // 2. xử lý recurringBooking
        recurrParent.setIsActive(false);
        recurrParent.setIsDeleted(true);
        RecurringBooking caneledRecurring = recurringBookingRepository.save(recurrParent);
        RecurringBookingResponse response = recurringBookingMapper.convertToDTO(caneledRecurring);

        // 3. hoàn tiền 50% của tổng số booking còn hiệu lực
        //log.error("check price: " + remainingAmount);
        String ownerId = recurrParent.getUser().getId();
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NotFoundException("Owner of this recurring booking not found."));

        // refund by policy
        InvoiceResponse invoiceResponse = refund(remainingAmount, owner, response.getPackageDurationMonths());

        CancelRecurringInfo responseForSendingMail = new CancelRecurringInfo(response, invoiceResponse.getAmount());

        // 4. gửi mail
        MessageWrapper messageWrapper = MessageWrapper.builder()
                .type(SendMailType.CANCEL_RECURRING.name())
                .payload(responseForSendingMail)
                .toEmail(owner.getEmail())
                .toFullName(owner.getFullName())
                .build();
        kafkaTemplate.send("cancel-recurring-notification-delivery", messageWrapper);

        return response;
    }

    private double discountRateByDurationMonths(int packageDurationMonths) {
        return switch (packageDurationMonths) {
            case 1 -> 0.95; //  5%
            case 3 -> 0.85; //  15%
            case 6 -> 0.75; //  25%
            case 9 -> 0.65; //  35%
            case 12 -> 0.55; // 45%
            default -> 1;   //  0%
        };
    }

    private InvoiceResponse refund(double remainingAmount, User user, int packageDurationMonths) {
        double disountRate = discountRateByDurationMonths(packageDurationMonths);

        Double refund = (remainingAmount * disountRate * 0.5);

        userService.refund(user, refund);
        // tạo hoá đơn
        InvoiceRequest invoiceRequest = new InvoiceRequest();
        invoiceRequest.setUserId(user.getId());
        invoiceRequest.setAmount(refund);
        invoiceRequest.setPaymentMethod(PaymentMethod.ACCOUNT_BALANCE);
        invoiceRequest.setPaymentStatus(PaymentStatus.PAID);
        invoiceRequest.setTransactionType(TransactionType.REFUND);
        return invoiceService.create(invoiceRequest);
    }


    @Transactional
    @Override
    public ResponseEntity<BaseResponse> searchByFieldNameAndPaginate(String fieldName, int page, int size) {
        //Pageable pageable = PageRequest.of(page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Booking> bookingPage = bookingRepository.searchByFieldName(fieldName, pageable);

        List<BookingResponse> responseList = bookingPage.getContent().stream()
                .map(bookingMapper::convertToResponse)
                .toList();

        PaginatedResponse<BookingResponse> paginatedResponse = new PaginatedResponse<>(
                responseList,
                bookingPage.getTotalPages(),
                bookingPage.getTotalElements()
        );

        return ResponseEntity.ok(
                new BaseResponse("Found the booking list by court name.", HttpStatus.OK.value(), paginatedResponse)
        );
    }

    @Override
    public Map<String, Double> getRevenueLastSixMonths() {
        Map<String, Double> revenueData = new HashMap<>();
        LocalDate now = LocalDate.now();
        ZonedDateTime startDate = ZonedDateTime.now().minusMonths(6);

        // Khởi tạo doanh thu cho từng tháng
        for (int i = 0; i < 6; i++) {
            String month = now.minusMonths(i).getMonth().name() + " " + now.minusMonths(i).getYear();
            revenueData.put(month, 0.0);
        }

        // Lấy tất cả bookings trong 6 tháng gần nhất
        List<Booking> bookings = bookingRepository.findBookingsLastSixMonths(startDate);
        List<RecurringBooking> recurringBookings = recurringBookingRepository.findRecurringBookingsLastSixMonths(startDate);

        // Tính doanh thu cho từng tháng từ bookings đơn lẻ
        for (Booking booking : bookings) {
            if (booking.getBookingDate() != null) {
                LocalDate bookingDate = booking.getBookingDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                String month = bookingDate.getMonth().name() + " " + bookingDate.getYear();
                revenueData.put(month, revenueData.get(month) + booking.getPrice());
            }
        }

        // Tính doanh thu cho từng tháng từ recurring bookings
        for (RecurringBooking recurringBooking : recurringBookings) {
            String recurringBookingId = recurringBooking.getId(); // Giữ nguyên ở dạng String

            if (recurringBookingId != null && !recurringBookingId.isEmpty()) {
                List<Booking> bookingsFromRecurring = bookingRepository.findByRecurringBookingId(recurringBookingId);

                for (Booking booking : bookingsFromRecurring) {
                    if (booking.getBookingDate() != null) {
                        LocalDate bookingDate = booking.getBookingDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                        String month = bookingDate.getMonth().name() + " " + bookingDate.getYear();
                        revenueData.put(month, revenueData.get(month) + booking.getPrice());
                    }
                }
            } else {
                // Xử lý trường hợp ID không hợp lệ
                System.out.println("Recurring booking ID is invalid: " + recurringBookingId);
            }
        }

        return revenueData;
    }

    @Override
    public ResponseEntity<BaseResponse> allBookingUser(String userId) {
        // Lấy thông tin người dùng hiện tại từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        String currentUserId = currentUser.getId();
        log.info("Current user for get all bookings: " + currentUserId);

        // Kiểm tra quyền truy cập
        if (!currentUserId.equals(userId)) {
            throw new CustomException("You do not have permission to access other users' bookings.", HttpStatus.FORBIDDEN.value());
        }

        // Lấy danh sách tất cả booking của user
        List<Booking> bookingList = bookingRepository.getAllBookingsByUserId(userId);

        // Kiểm tra nếu danh sách trống
        if (bookingList.isEmpty()) {
            throw new CustomException("You don't have any bookings yet!", HttpStatus.NOT_FOUND.value());
        }

        // Chuyển đổi danh sách sang response và sắp xếp theo ngày gần nhất
        List<BookingResponse> responseList = bookingList.stream()
                .sorted(Comparator.comparing(Booking::getStartTime).reversed()) // Sắp xếp giảm dần theo thời gian bắt đầu
                .map(bookingMapper::convertToResponse)
                .toList();

        return ResponseEntity.ok(new BaseResponse("Found all bookings.", HttpStatus.OK.value(), responseList));
    }

}
