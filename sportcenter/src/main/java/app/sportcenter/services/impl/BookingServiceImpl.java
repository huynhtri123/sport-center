package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.PaginatedResponse;
import app.sportcenter.commons.Role;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.*;
import app.sportcenter.models.entities.*;
import app.sportcenter.repositories.BookingRepository;
import app.sportcenter.repositories.FieldRepository;
import app.sportcenter.repositories.RecurringBookingRepository;
import app.sportcenter.repositories.UserRepository;
import app.sportcenter.services.BookingService;
import app.sportcenter.services.MailService;
import app.sportcenter.utils.mappers.BookingMapper;
import app.sportcenter.utils.mappers.FieldMapper;
import app.sportcenter.utils.mappers.RecurringBookingMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BookingServiceImpl implements BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private BookingMapper bookingMapper;
    @Autowired
    private RecurringBookingRepository recurringBookingRepository;
    @Autowired
    private RecurringBookingMapper recurringBookingMapper;
    @Autowired
    private FieldRepository fieldRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MailService mailService;
    @Autowired
    private FieldMapper fieldMapper;

    // đặt lẻ
    @Transactional
    @Override
    public ResponseEntity<BaseResponse> createBooking(BookingRequest bookingRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Field field = fieldRepository.findById(bookingRequest.getFieldId())
                .orElseThrow(() -> new CustomException("Không tìm thấy field có id này", HttpStatus.NOT_FOUND.value()));
        log.info("Booking user: " + currentUser.getFullName());
        log.info("Booking field: " + field.getFieldName());

        // tính toán thời gian kết thúc dựa trên số giờ đặt
        // vì theo quy ước converter đã cấu hình thì đầu vào mongo sẽ phải là +0,
        // nên đầu vào ta dùng giờ VN nhưng định dạng +0,
        // do đó cần trừ đi 7 múi để lưu vào db chính xác, khi get ra thì sẽ là +7 là vừa
        ZonedDateTime startTime = bookingRequest.getStartTime().minusHours(7);
        ZonedDateTime endTime = startTime.plusHours(bookingRequest.getNumberOfHours());
        //log.info((startTime+ "/" + endTime));

        // tìm danh sách booking có timeSlots có trạng thái IN_USE trong khoảng thời gian này
        // nếu sân trống thì list này = 0
        List<Booking> inUseBookingList = bookingRepository.findInUseTimeSlotsByFieldAndTimeRange(field.getId(),
                startTime, endTime);
        // nếu có nghĩa là kẹt lịch, out
        if (inUseBookingList.isEmpty()) {
            // tạo ra các timeSlot AVAILABLE cho khoảng tgian đặt (ví dụ 7-9h -> tạo 2 timeSlot AVAILABLE
            field.createTimeSlots(startTime, endTime);

            // Đổi trạng thái của các TimeSlot liên quan đến booking thành IN_USE
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
            booking.setRecurring(false);        // đánh dấu đây là đặt lẻ
            Booking savedBooking = bookingRepository.save(booking);

            BookingResponse response = bookingMapper.convertToResponse(savedBooking);
            // Gửi mail thông báo
//            sendMailBooking(currentUser, response);

            return ResponseEntity.ok(
                    new BaseResponse("Đặt sân thành công!", HttpStatus.OK.value(), response)
            );
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new BaseResponse("Sân không trống trong thời gian này!", HttpStatus.CONFLICT.value(), null)
        );
    }

    // đặt theo lịch cứng
    @Transactional
    @Override
    public ResponseEntity<BaseResponse> createRecurringBooking(RecurringBookingRequest recurringBookingRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Field field = fieldRepository.findById(recurringBookingRequest.getFieldId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy Field có id này"));
        log.info("RecurringBooking user: " + currentUser.getFullName());
        log.info("RecurringBooking field: " + field.getFieldName());

        RecurringBooking recurringBooking = recurringBookingMapper.convertToEntity(recurringBookingRequest, field, currentUser);
        recurringBooking.setStartDate(recurringBooking.getStartDate().minusHours(7));
        recurringBooking.setStartTime(recurringBooking.getStartTime().minusHours(7));

        List<TimeSlot> recurringTimeSlots = recurringBooking.generateTimeSlots();
        for (TimeSlot timeSlot : recurringTimeSlots) {
            // tìm danh sách booking có timeSlots có trạng thái IN_USE trong khoảng thời gian này
            // nếu sân trống thì list này = 0
            List<Booking> inUseBookingList = bookingRepository.findInUseTimeSlotsByFieldAndTimeRange(field.getId(),
                    timeSlot.getStartTime(), timeSlot.getEndTime());
            if (!inUseBookingList.isEmpty()) {
                throw new CustomException("Thất bại! Có ít nhất 1 timeSlot không trống ở khung giờ này trong tương lai",
                        HttpStatus.NOT_FOUND.value());
            }
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
            booking.setRecurring(true);         // đánh dấu đây là đặt cứng
            bookingsToSave.add((booking));
        }
        fieldRepository.save(field);
        bookingRepository.saveAll(bookingsToSave);
        recurringBooking.setBookingIds(bookingsToSave.stream().map(Booking::getId).collect(Collectors.toList()));

        RecurringBooking savedRecurringBooking = recurringBookingRepository.save(recurringBooking);
        RecurringBookingResponse response = recurringBookingMapper.convertToDTO(savedRecurringBooking);

        //send mail
//        sendMailRecurringBooking(currentUser, response);

        String message = "Đặt sân theo lịch cứng (" + recurringBooking.getInterval() + "/" + recurringBooking.getPackageDurationMonths() + " months) thành công!";
        return ResponseEntity.ok(
                new BaseResponse(message, HttpStatus.OK.value(), response)
        );

    }

    @Override
    public Double getBookingPrice(BookingRequest bookingRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Field field = fieldRepository.findById(bookingRequest.getFieldId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sân với id này"));
        Booking booking = bookingMapper.convertToEntity(bookingRequest, field, currentUser);

        return booking.getPrice();
    }

    @Override
    public Double getRecurringBookingPrice(RecurringBookingRequest recurringBookingRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Field field = fieldRepository.findById(recurringBookingRequest.getFieldId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sân với id này"));
        RecurringBooking recurringBooking = recurringBookingMapper.convertToEntity(recurringBookingRequest, field, currentUser);

        return recurringBooking.getPrice();
    }

    @Override
    public ResponseEntity<BaseResponse> getRecurringBookingByContainBookingId(String bookingId) {
        RecurringBooking recurringBooking = recurringBookingRepository.getByContainBookingId(bookingId);
        if (recurringBooking == null) {
            throw new NotFoundException("Không tìm thấy RecurringBooking nào chứa bookingId: " + bookingId);
        }
        RecurringBookingResponse response = recurringBookingMapper.convertToDTO(recurringBooking);
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy RecurringBooking", HttpStatus.OK.value(), response)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy booking!", HttpStatus.NOT_FOUND.value()));

        BookingResponse response = bookingMapper.convertToResponse(booking);

        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy Booking.", HttpStatus.OK.value(), response)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getBookingByUserId(String userId) {
        List<Booking> bookingList = bookingRepository.findBookingByUserId(userId);
        if (bookingList.isEmpty()) {
            throw new CustomException("Không tìm thấy Booking nào của user này!", HttpStatus.NOT_FOUND.value());
        }

        List<BookingResponse> responseList = bookingList.stream().map(bookingMapper::convertToResponse).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách Booking của user này.", HttpStatus.OK.value(), responseList)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getCurrentBookingsOfCurrentUser(String userId) {
        // Lấy thông tin người dùng hiện tại từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        String currentUserId = currentUser.getId();
        log.info("Current user for get my bookings: " + currentUserId);

        // Kiểm tra xem userId truyền vào có trùng với userId trong JWT hay không
        if (!currentUserId.equals(userId)) {
            throw new CustomException("Bạn không có quyền truy cập bookings của người khác.", HttpStatus.FORBIDDEN.value());
        }

        ZonedDateTime now = ZonedDateTime.now();
        // lấy danh sách booking của user hiện tại, còn hiệu lực
        List<Booking> bookingList = bookingRepository.getCurrentBookingsOfCurrentUser(userId, now, FieldStatus.IN_USE.name());
        if (bookingList.isEmpty()) {
            throw new CustomException("Không tìm thấy Booking nào của user này!", HttpStatus.NOT_FOUND.value());
        }

        List<BookingResponse> responseList = bookingList.stream().map(bookingMapper::convertToResponse).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách Booking của user này.", HttpStatus.OK.value(), responseList)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getBookingByFieldId(String fieldId) {
        List<Booking> bookingList = bookingRepository.getBookingByFieldId(fieldId);
        if (bookingList.isEmpty()) {
            throw new CustomException("Không tìm thấy Booking nào của sân này!", HttpStatus.NOT_FOUND.value());
        }

        List<BookingResponse> responseList = bookingList.stream().map(bookingMapper::convertToResponse).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách Booking của sân này.", HttpStatus.OK.value(), responseList)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getBookingsByStartTime(ZonedDateTime startTime) {
        List<Booking> bookingList = bookingRepository.getBookingByStartTime(startTime);
        if (bookingList.isEmpty()) {
            throw new CustomException("Không tìm thấy Booking nào của sân này!", HttpStatus.NOT_FOUND.value());
        }

        List<BookingResponse> responseList = bookingList.stream().map(bookingMapper::convertToResponse).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách Booking của sân này.", HttpStatus.OK.value(), responseList)
        );
    }


    @Transactional
    @Override
    public ResponseEntity<BaseResponse> getAllBookings(int page, int size) {
        Page<Booking> bookingPage = bookingRepository.findAllActive(PageRequest.of(page, size));

        if (bookingPage.isEmpty()) {
            throw new CustomException("Không tìm thấy Booking nào đang hoạt động!", HttpStatus.NOT_FOUND.value());
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
                new BaseResponse("Tìm thấy danh sách Booking đang hoạt động.", HttpStatus.OK.value(), paginatedResponse)
        );
    }

    // 1. tạo ra (18) timeSLot AVAILABLE trải dài nguyên ngày,
    // 2. duyệt "bookings" của field đó trong ngày đso nếu có thì
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
                new BaseResponse("Lấy lịch sân thành công.", HttpStatus.OK.value(), fieldResponse));
    }


    @Transactional
    @Override
    public ResponseEntity<BaseResponse> changeIsDeleted(String bookingId, boolean flag) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Không tìm thấy booking!", HttpStatus.NOT_FOUND.value()));
        booking.setIsDeleted(flag);
        Booking savedBooking = bookingRepository.save(booking);

        BookingResponse response = bookingMapper.convertToResponse(savedBooking);
        String message = "Thành công. Trạng thái hiện tại: isDeleted=" + booking.getIsDeleted();

        return ResponseEntity.ok(
                new BaseResponse(message, HttpStatus.OK.value(), response)
        );
    }
    @Transactional
    @Override
    public ResponseEntity<BaseResponse> forceDelete(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Không tìm thấy booking!", HttpStatus.NOT_FOUND.value()));
        BookingResponse response = bookingMapper.convertToResponse(booking);

        bookingRepository.deleteById(bookingId);
        return ResponseEntity.ok(
                new BaseResponse("Xoá cứng thành công.", HttpStatus.OK.value(), response)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> cancelBooking(String bookingId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy Booking này"));
        // chỉ chủ sỡ hữu hoặc admin mới có quyền huỷ booking
        if (booking.getUser().getId().equals(currentUser.getId()) || currentUser.getRole().equals(Role.ADMIN)) {
            Field field = booking.getField();
            if (field == null) {
                throw new NotFoundException("Không tìm thấy Field trong Booking này");
            }
            ZonedDateTime bookingStartTime = booking.getStartTime();
            ZonedDateTime bookingEndTime = booking.getEndTime();

            ZonedDateTime now = ZonedDateTime.now();

            // kiểm tra nếu booking đã hết hạn thì out
            if (bookingEndTime.isBefore(now) || !booking.getIsActive() || booking.getIsDeleted()) {
                throw new CustomException("Booking này đã hết hạn, không thể huỷ!", HttpStatus.BAD_REQUEST.value());
            }

            // tạo timeSlot AVAILABLE trong khoảng thời gian này
            field.createTimeSlots(bookingStartTime, bookingEndTime);
            fieldRepository.save(field);

            // huỷ -> tắt isActive
            booking.setField(field);
            booking.setIsActive(false);
            Booking canceledBooking = bookingRepository.save(booking);

            BookingResponse response = bookingMapper.convertToResponse(canceledBooking);
            log.info("Đã huỷ booking " + canceledBooking.getId());

            // hoàn tiền nếu là đặt lẻ
            User owner = userRepository.findById(booking.getUser().getId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy chủ sở hữu booking này"));
            if (!booking.isRecurring()) {
                owner.setAccountBalance(owner.getAccountBalance() + booking.getPrice());
                userRepository.save(owner);
            }

            // send mail
//            sendMailCancelBooking(owner, response);

            return ResponseEntity.ok(
                    new BaseResponse("Huỷ đặt sân thành công.", HttpStatus.OK.value(), response)
            );

        } else {
            throw new CustomException("Bạn không có quyền huỷ đặt sân của người khác", HttpStatus.FORBIDDEN.value());
        }

    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> cancelRecurringByBookingId(String bookingId) {
        RecurringBooking recurrParent = recurringBookingRepository.getByContainBookingId(bookingId);
        if (recurrParent == null) {
            throw new NotFoundException("Không tìm thấy Recurring nào chứa bookingId này!");
        }

        // xác thực
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) auth.getPrincipal();
        if (currUser.getRole() != Role.ADMIN && !currUser.getId().equals(recurrParent.getUser().getId())) {
            throw new CustomException("Bạn không có quyền huỷ cứng recurring của người khác!", HttpStatus.FORBIDDEN.value());
        }

        // cancel
        // 1. xử lý bookings liên quan
        List<Booking> relevantBooking = recurrParent.getBookingIds()
                .stream()
                .map(id -> bookingRepository.findById(id)
                        .orElse(null))
                .filter(Objects::nonNull)
                .toList();
        List<Field> fieldsToSave = new ArrayList<>();
        List<Booking> bookingsToSave = new ArrayList<>();
        if (!relevantBooking.isEmpty()) {
            for (Booking booking : relevantBooking) {
                ZonedDateTime startTime = booking.getStartTime();
                ZonedDateTime endTime = booking.getEndTime();
                Field field = booking.getField();

                field.createTimeSlots(startTime, endTime);  // reset fields status -> AVAILABLE
                booking.setIsActive(false);                 // tắt hoạt động
                fieldsToSave.add(field);
                bookingsToSave.add(booking);
            }
            fieldRepository.saveAll(fieldsToSave);
            bookingRepository.saveAll(bookingsToSave);
        }
        // 2. xử lý recurringBooking
        recurrParent.setIsActive(false);
        RecurringBooking caneledRecurring = recurringBookingRepository.save(recurrParent);
        RecurringBookingResponse response = recurringBookingMapper.convertToDTO(caneledRecurring);

        // 3. hoàn tiền 50%
        Double price = recurrParent.getPrice();
        Double refund = price / 2;
        String ownerId = recurrParent.getUser().getId();
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy chủ nhân của recurringBooking này"));
        owner.setAccountBalance(owner.getAccountBalance() + refund);
        userRepository.save(owner);

        // 4. gửi mail
//        sendMailRecurringBookingCancel(owner, response);

        return ResponseEntity.ok(
                new BaseResponse("Huỷ cứng recurringBooking thành công, 50% số tiền đã hoàn vào số dư.",
                        HttpStatus.OK.value(), response)
        );
    }

    private void sendMailBooking(User user, BookingResponse bookingResponse) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss Z");
        try {
            // chuyển đổi các thời gian sang múi giờ Việt Nam
            ZonedDateTime bookingDateInVietnam = bookingResponse.getBookingDate().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
            ZonedDateTime startTimeInVietnam = bookingResponse.getStartTime().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
            ZonedDateTime endTimeInVietnam = bookingResponse.getEndTime().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));

            String email = user.getEmail();
            String fullName = user.getFullName();
            String bookingDate = bookingDateInVietnam.format(formatter);
            String numberOfHours = bookingResponse.getNumberOfHours().toString();
            String startTime = startTimeInVietnam.format(formatter);
            String endTime = endTimeInVietnam.format(formatter);
            String totalPrice = bookingResponse.getTotalPrice().toString();

            mailService.sendMailBooking(email, fullName, bookingDate, numberOfHours, startTime, endTime, totalPrice);

        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail booking: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    public void sendMailRecurringBooking(User user, RecurringBookingResponse recurringBookingResponse) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss Z");
        try {
            String email = user.getEmail();
            String fullName = user.getFullName();
            String fieldName = recurringBookingResponse.getField().getFieldName();

            // Chuyển thời gian sang múi giờ Việt Nam (GMT+7)
            String startDate = recurringBookingResponse.getStartDate()
                    .withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(formatter);
            String startTime = recurringBookingResponse.getStartTime()
                    .withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(formatter);
            String endDate = recurringBookingResponse.getEndDate()
                    .withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(formatter);
            String endTime = recurringBookingResponse.getEndTime()
                    .withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(formatter);

            String interval = recurringBookingResponse.getInterval().name(); // DAILY, WEEKLY, MONTHLY
            String numberOfHours = recurringBookingResponse.getNumberOfHours().toString();
            String packageDurationMonths = recurringBookingResponse.getPackageDurationMonths().toString();
            String price = recurringBookingResponse.getPrice().toString();

            // Gọi phương thức gửi mail với các thông tin đã được định dạng
            mailService.sendMailRecurringBooking(email, fullName, fieldName, startDate, startTime, endDate, endTime, interval, numberOfHours, packageDurationMonths, price);

        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail đặt sân định kỳ: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    public void sendMailRecurringBookingCancel(User user, RecurringBookingResponse recurringBookingResponse) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss Z");
        try {
            String email = user.getEmail();
            String fullName = user.getFullName();
            String fieldName = recurringBookingResponse.getField().getFieldName();

            // Chuyển thời gian sang múi giờ Việt Nam (GMT+7)
            String startDate = recurringBookingResponse.getStartDate()
                    .withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(formatter);
            String startTime = recurringBookingResponse.getStartTime()
                    .withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(formatter);
            String endDate = recurringBookingResponse.getEndDate()
                    .withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(formatter);
            String endTime = recurringBookingResponse.getEndTime()
                    .withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"))
                    .format(formatter);

            String interval = recurringBookingResponse.getInterval().name(); // DAILY, WEEKLY, MONTHLY
            String numberOfHours = recurringBookingResponse.getNumberOfHours().toString();
            Double price = recurringBookingResponse.getPrice();
            String duration = recurringBookingResponse.getPackageDurationMonths().toString();
            Double refund = price / 2;

            // Gọi phương thức gửi mail với các thông tin đã được định dạng
            mailService.sendMailRecurringBookingCancel(email, fullName, fieldName, startDate,
                    startTime, endDate, endTime, interval, numberOfHours, price, refund, duration);

        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail hủy đặt sân định kỳ: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }


    private void sendMailCancelBooking(User user, BookingResponse canceledBooking) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss Z");
        try {
            // Chuyển đổi các thời gian sang múi giờ Việt Nam
            ZonedDateTime bookingDateInVietnam = canceledBooking.getBookingDate().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
            ZonedDateTime startTimeInVietnam = canceledBooking.getStartTime().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
            ZonedDateTime endTimeInVietnam = canceledBooking.getEndTime().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));

            String email = user.getEmail();
            String fullName = user.getFullName();
            String bookingDate = bookingDateInVietnam.format(formatter);
            String startTime = startTimeInVietnam.format(formatter);
            String endTime = endTimeInVietnam.format(formatter);
            String price = canceledBooking.getTotalPrice().toString();

            // Gọi hàm gửi email
            mailService.sendMailCancelBooking(email, fullName, bookingDate, startTime, endTime, price);

        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail huỷ booking: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

}
