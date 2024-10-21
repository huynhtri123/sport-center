package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.BookingRequest;
import app.sportcenter.models.dto.BookingResponse;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface BookingService {
    public ResponseEntity<BaseResponse> createBooking(BookingRequest bookingRequest);
//    public BookingResponse getBookingById(String id);
//    public List<BookingResponse> getAllBookings();
//    public BookingResponse updateBooking(String id, BookingRequest bookingRequest);
//    public void cancelBooking(String id);
}
