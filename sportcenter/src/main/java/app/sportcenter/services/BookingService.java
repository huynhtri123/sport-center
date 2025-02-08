package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.*;
import org.springframework.http.ResponseEntity;

import java.time.ZonedDateTime;
import java.util.Map;

public interface BookingService {

    // ĐẶT LẺ
    public BookingResponse createBooking(BookingRequest bookingRequest);

    public BookingResponse confirmBooking(String bookingId);

    // ĐẶT CỨNG
    public ResponseEntity<BaseResponse> createRecurringBooking(RecurringBookingRequest recurringBookingRequest);

    public RecurringBookingResponse confirmRecurringBooking(String recurringId);

    // UPDATE
    // soft delete & restore
    public ResponseEntity<BaseResponse> changeIsDeleted(String bookingId, boolean flag);

    public ResponseEntity<BaseResponse> forceDelete(String bookingId);

    // huỷ lẻ
    public ResponseEntity<BaseResponse> cancelBooking(String bookingId);

    // huỷ cứng
    public ResponseEntity<BaseResponse> cancelRecurringByBookingId(String bookingId);

    // GET
    public ResponseEntity<BaseResponse> getBookingById(String id);

    public ResponseEntity<BaseResponse> getBookingByUserId(String userId);

    public ResponseEntity<BaseResponse> getCurrentBookingsOfCurrentUser(String userId);

    public ResponseEntity<BaseResponse> getBookingByFieldId(String fieldId);

    public ResponseEntity<BaseResponse> getBookingsByStartTime(ZonedDateTime startTime);

    public ResponseEntity<BaseResponse> getAllBookings(int page, int size);

    // lấy tất cả booking theo khoảng thời gian cụ thể. Ví dụ theo ngày (7:00 ngày 1/1/2024 - 22:00 ngày 1/1/2024)
    public ResponseEntity<BaseResponse> getFieldSchedule(String fieldId, ZonedDateTime startOfDay, ZonedDateTime endOfDay);

    public Double getBookingPrice(BookingRequest bookingRequest);

    public Double getRecurringBookingPrice(RecurringBookingRequest recurringBookingRequest);

    // lấy giá tiền còn lại của recuring theo id của booking con
    // (vd: đặt cứng có 5 booking, mà đã có 1 booking trong quá khứ, thì hàm này trả về giá của tổng 4 cái còn lại)
    public Double getRemainingAmountOfRecurringByBookingId(String bookingId);

    public ResponseEntity<BaseResponse> getRecurringBookingByContainBookingId(String bookingId);

    public ResponseEntity<BaseResponse> searchByFieldNameAndPaginate(String fieldName, int page, int size);

    public Map<String, Double> getRevenueLastSixMonths();

}
