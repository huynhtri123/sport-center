package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.FieldStatus;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.BookingRequest;
import app.sportcenter.models.dto.BookingResponse;
import app.sportcenter.models.entities.Booking;
import app.sportcenter.models.entities.Field;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.BookingRepository;
import app.sportcenter.repositories.FieldRepository;
import app.sportcenter.repositories.UserRepository;
import app.sportcenter.services.BookingService;
import app.sportcenter.services.MailService;
import app.sportcenter.utils.mappers.BookingMapper;
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

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> createBooking(BookingRequest bookingRequest) {
        User user = userRepository.findById(bookingRequest.getUserId())
                .orElseThrow(() -> new CustomException("Không tìm thấy user có id này", HttpStatus.NOT_FOUND.value()));
        Field field = fieldRepository.findById(bookingRequest.getFieldId())
                .orElseThrow(() -> new CustomException("Không tìm thấy field có id này", HttpStatus.NOT_FOUND.value()));
        log.info("Booking user: " + user.getFullName());
        log.info("Booking field: " + field.getFieldName());

        // Kiểm tra xem sân có trống hay không
        if (!field.getFieldStatus().equals(FieldStatus.AVAILABLE)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Sân không còn trống (not AVAILABLE)!",
                            HttpStatus.NOT_FOUND.value(), null)
            );
        }

        // ok -> Đổi trạng thái sân sang không còn có sẵn
        field.setFieldStatus(FieldStatus.IN_USE);
        fieldRepository.save(field);

        // booking mới với trạng thái field đã được cập nhật
        Booking booking = bookingMapper.convertToEntity(bookingRequest, field);
        Booking savedBooking = bookingRepository.save(booking);

        BookingResponse response = bookingMapper.convertToResponse(savedBooking);
        // gửi mail thông báo
        sendMailBooking(user, response);

        return ResponseEntity.ok(
                new BaseResponse("Tạo mới Booking thành công!", HttpStatus.OK.value(), response)
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
        log.info(currentUserId);

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

    @Override
    public ResponseEntity<BaseResponse> forceDelete(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Không tìm thấy booking!", HttpStatus.NOT_FOUND.value()));
//        boolean isExpired = booking.getEndTime().isBefore(ZonedDateTime.now());
//        if (!isExpired) {
//            throw new CustomException("Booking này chưa hết hạn!", HttpStatus.BAD_REQUEST.value());
//        }
        BookingResponse response = bookingMapper.convertToResponse(booking);

        bookingRepository.deleteById(bookingId);
        return ResponseEntity.ok(
                new BaseResponse("Xoá cứng thành công.", HttpStatus.OK.value(), response)
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

}
