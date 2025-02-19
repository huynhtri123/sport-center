package app.sportcenter.utils.mappers;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.request.BookingRequest;
import app.sportcenter.models.dto.response.BookingResponse;
import app.sportcenter.models.dto.response.FieldResponse;
import app.sportcenter.models.entities.Booking;
import app.sportcenter.models.entities.Field;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;

@Component
public class BookingMapper {
    @Autowired
    private FieldMapper fieldMapper;
    @Autowired
    private UserRepository userRepository;

    public Booking convertToEntity(BookingRequest bookingRequest, Field updatedField, User user) {

        Booking booking = Booking.builder()
                .user(user)
                .field(updatedField)
                .bookingDate(ZonedDateTime.now())       // lấy thời gian hiện tại để làm thời gian đặt sân
                .numberOfHours(bookingRequest.getNumberOfHours())
                .startTime(bookingRequest.getStartTime())
                .build();

        // Tính thời gian kết thúc dựa trên số giờ đặt
        booking.calculateEndTime();

        return booking;
    }

    public BookingResponse convertToResponse(Booking booking) {
        if (booking == null) {
            throw new CustomException("Input mapper is null!", HttpStatus.BAD_REQUEST.value());
        }
        // Chuyển đổi từ Field sang FieldResponse
        Field field = booking.getField();
        FieldResponse fieldResponse = fieldMapper.convertToDTO(field);

        BookingResponse bookingResponse = new BookingResponse();
        bookingResponse.setId(booking.getId());
        bookingResponse.setFieldResponse(fieldResponse);
        bookingResponse.setUserId(booking.getUser().getId());           // ID người dùng
        bookingResponse.setUserName(booking.getUser().getUsername());   // Tên người dùng
        bookingResponse.setUserFullName(booking.getUser().getFullName());
        bookingResponse.setUserPhoneNumber(booking.getUser().getPhoneNumber());
        bookingResponse.setBookingDate(booking.getBookingDate());       // Ngày đặt sân
        bookingResponse.setNumberOfHours(booking.getNumberOfHours());   // Số giờ đặt sân
        bookingResponse.setStartTime(booking.getStartTime());           // Thời gian bắt đầu tính giờ
        bookingResponse.setEndTime(booking.getEndTime());               // Thời gian kết thúc
        bookingResponse.setTotalPrice(booking.getPrice());
        bookingResponse.setRecurring(booking.isRecurring());
        // các thuộc tính từ BaseEntity
        bookingResponse.setCreatedAt(booking.getCreatedAt());
        bookingResponse.setUpdatedAt(booking.getUpdatedAt());
        bookingResponse.setIsActive(booking.getIsActive());
        bookingResponse.setIsDeleted(booking.getIsDeleted());

        return bookingResponse;
    }
}
