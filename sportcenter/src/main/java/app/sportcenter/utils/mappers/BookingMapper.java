package app.sportcenter.utils.mappers;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.BookingRequest;
import app.sportcenter.models.dto.BookingResponse;
import app.sportcenter.models.dto.FieldResponse;
import app.sportcenter.models.entities.Booking;
import app.sportcenter.models.entities.Field;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.FieldRepository;
import app.sportcenter.repositories.UserRepository;
import org.modelmapper.ModelMapper;
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

    public Booking convertToEntity(BookingRequest bookingRequest, Field updatedField) {
        User user = userRepository.findById(bookingRequest.getUserId())
                .orElseThrow(() -> new CustomException("Không tìm thấy user có id này", HttpStatus.NOT_FOUND.value()));

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
        bookingResponse.setBookingDate(booking.getBookingDate());       // Ngày đặt sân
        bookingResponse.setNumberOfHours(booking.getNumberOfHours());   // Số giờ đặt sân
        bookingResponse.setStartTime(booking.getStartTime());           // Thời gian bắt đầu tính giờ
        bookingResponse.setEndTime(booking.getEndTime());               // Thời gian kết thúc
        bookingResponse.setTotalPrice(booking.getPrice());
        // các thuộc tính từ BaseEntity
        bookingResponse.setCreatedAt(booking.getCreatedAt());
        bookingResponse.setUpdatedAt(booking.getUpdatedAt());
        bookingResponse.setIsActive(booking.getIsActive());
        bookingResponse.setIsDeleted(booking.getIsDeleted());

        return bookingResponse;
    }
}
