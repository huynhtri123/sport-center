package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.BookingRequest;
import org.springframework.http.ResponseEntity;

import java.time.ZonedDateTime;

public interface BookingService {
    public ResponseEntity<BaseResponse> createBooking(BookingRequest bookingRequest);
    public ResponseEntity<BaseResponse> getBookingById(String id);
    public ResponseEntity<BaseResponse> getBookingByUserId(String userId);
    public ResponseEntity<BaseResponse> getCurrentBookingsOfCurrentUser(String userId);
    public ResponseEntity<BaseResponse> getBookingByFieldId(String fieldId);
    public ResponseEntity<BaseResponse> getBookingsByStartTime(ZonedDateTime startTime);
    public ResponseEntity<BaseResponse> getAllBookings();

    public ResponseEntity<BaseResponse> changeIsDeleted(String bookingId, boolean flag);
    public ResponseEntity<BaseResponse> forceDelete(String bookingId);
}
