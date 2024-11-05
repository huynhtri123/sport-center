package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.Role;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.BookingRequest;
import app.sportcenter.models.dto.BookingResponse;
import app.sportcenter.models.dto.FieldResponse;
import app.sportcenter.models.entities.Booking;
import app.sportcenter.models.entities.Field;
import app.sportcenter.models.entities.TimeSlot;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.BookingRepository;
import app.sportcenter.repositories.FieldRepository;
import app.sportcenter.repositories.UserRepository;
import app.sportcenter.services.BookingService;
import app.sportcenter.services.MailService;
import app.sportcenter.utils.mappers.BookingMapper;
import app.sportcenter.utils.mappers.FieldMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
public class BookingServiceImpl implements BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private BookingMapper bookingMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FieldRepository fieldRepository;
    @Autowired
    private MailService mailService;
    @Autowired
    private FieldMapper fieldMapper;

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
            Booking savedBooking = bookingRepository.save(booking);

            BookingResponse response = bookingMapper.convertToResponse(savedBooking);
            // Gửi mail thông báo
            sendMailBooking(currentUser, response);

            return ResponseEntity.ok(
                    new BaseResponse("Đặt sân thành công!", HttpStatus.OK.value(), response)
            );
        }

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new BaseResponse("Sân không trống trong thời gian này!", HttpStatus.CONFLICT.value(), null)
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
    public ResponseEntity<BaseResponse> getAllBookings() {
        List<Booking> bookingList = bookingRepository.getAllActive();
        if (bookingList.isEmpty()) {
            throw new CustomException("Không tìm thấy Booking nào đang hoạt động!", HttpStatus.NOT_FOUND.value());
        }

        List<BookingResponse> responseList = bookingList.stream().map(bookingMapper::convertToResponse).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách Booking đang hoạt động.", HttpStatus.OK.value(), responseList)
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

            // tạo timeSlot AVAILABLE trong khoảng thời gian này
            field.createTimeSlots(bookingStartTime, bookingEndTime);
            fieldRepository.save(field);

            // huỷ -> tắt isActive
            booking.setField(field);
            booking.setIsActive(false);
            Booking canceledBooking = bookingRepository.save(booking);

            BookingResponse response = bookingMapper.convertToResponse(canceledBooking);
            log.info("Đã huỷ booking " + canceledBooking.getId());
            // send mail
            sendMailCancelBooking(currentUser, response);

            return ResponseEntity.ok(
                    new BaseResponse("Huỷ đặt sân thành công", HttpStatus.OK.value(), response)
            );

        } else {
            throw new CustomException("Bạn không có quyền huỷ đặt sân của người khác", HttpStatus.BAD_REQUEST.value());
        }

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

            // Gọi hàm gửi email
            mailService.sendMailCancelBooking(email, fullName, bookingDate, startTime, endTime);

        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail huỷ booking: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

}
