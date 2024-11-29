package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.BookingRequest;
import app.sportcenter.models.dto.RecurringBookingRequest;
import app.sportcenter.models.dto.RecurringBookingResponse;
import app.sportcenter.models.dto.TimeRequest;
import org.springframework.http.ResponseEntity;

import java.time.ZonedDateTime;

public interface BookingService {
    public ResponseEntity<BaseResponse> createBooking(BookingRequest bookingRequest);
    public ResponseEntity<BaseResponse> confirmBooking(String bookingId);
    public ResponseEntity<BaseResponse> getBookingById(String id);
    public ResponseEntity<BaseResponse> getBookingByUserId(String userId);
    public ResponseEntity<BaseResponse> getCurrentBookingsOfCurrentUser(String userId);
    public ResponseEntity<BaseResponse> getBookingByFieldId(String fieldId);
    public ResponseEntity<BaseResponse> getBookingsByStartTime(ZonedDateTime startTime);
    public ResponseEntity<BaseResponse> getAllBookings(int page, int size);
    // lấy tất cả booking theo khoảng thời gian cụ thể. Ví dụ theo ngày (7:00 ngày 1/1/2024 - 22:00 ngày 1/1/2024)
    public ResponseEntity<BaseResponse> getFieldSchedule(String fieldId, ZonedDateTime startOfDay, ZonedDateTime endOfDay);

    // softDelete & restore
    public ResponseEntity<BaseResponse> changeIsDeleted(String bookingId, boolean flag);
    public ResponseEntity<BaseResponse> forceDelete(String bookingId);
    // huỷ đặt sân
    public ResponseEntity<BaseResponse> cancelBooking(String bookingId);
    // huỷ cứng
    public ResponseEntity<BaseResponse> cancelRecurringByBookingId(String bookingId);

    // đặt theo lịch
    public ResponseEntity<BaseResponse> createRecurringBooking(RecurringBookingRequest recurringBookingRequest);

    public Double getBookingPrice(BookingRequest bookingRequest);
    public Double getRecurringBookingPrice(RecurringBookingRequest recurringBookingRequest);

    public ResponseEntity<BaseResponse> getRecurringBookingByContainBookingId(String bookingId);
}
