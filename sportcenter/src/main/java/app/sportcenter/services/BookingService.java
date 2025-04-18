package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.request.BookingRequest;
import app.sportcenter.models.dto.request.RecurringBookingRequest;
import app.sportcenter.models.dto.response.BookingData;
import app.sportcenter.models.dto.response.BookingResponse;
import app.sportcenter.models.dto.response.RecurringBookingResponse;
import app.sportcenter.models.entities.Booking;
import app.sportcenter.models.entities.TimeSlot;
import org.springframework.http.ResponseEntity;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

public interface BookingService {

    // ĐẶT LẺ
    public BookingResponse createBooking(BookingRequest bookingRequest);

    public BookingResponse confirmBooking(String bookingId);

    // huỷ lẻ
    public BookingResponse cancelBooking(String bookingId);

    // ĐẶT CỨNG
    public RecurringBookingResponse createRecurringBooking(RecurringBookingRequest recurringBookingRequest);

    public RecurringBookingResponse confirmRecurringBooking(String recurringId);

    // huỷ cứng
    public RecurringBookingResponse cancelRecurringByBookingId(String bookingId);

    // GET
    // lấy tất cả booking theo khoảng thời gian cụ thể. Ví dụ theo ngày (7:00 ngày 1/1/2024 - 22:00 ngày 1/1/2024)
    public ResponseEntity<BaseResponse> getFieldSchedule(String fieldId, ZonedDateTime startOfDay, ZonedDateTime endOfDay);

    public ResponseEntity<BaseResponse> getBookingById(String id);

    public ResponseEntity<BaseResponse> getBookingByUserId(String userId);

    public ResponseEntity<BaseResponse> getCurrentBookingsOfCurrentUser(Integer year);

    public ResponseEntity<BaseResponse> getBookingByFieldId(String fieldId);

    public ResponseEntity<BaseResponse> getBookingsByStartTime(ZonedDateTime startTime);

    public ResponseEntity<BaseResponse> getAllBookings(int page, int size);

    public Double getBookingPrice(BookingRequest bookingRequest);

    public Double getRecurringBookingPrice(RecurringBookingRequest recurringBookingRequest);

    public List<TimeSlot> getTimeSlotsForRecurring(RecurringBookingRequest recurringBookingRequest);

    // lấy giá tiền còn lại của recuring theo id của booking con
    // (vd: đặt cứng có 5 booking, mà đã có 1 booking trong quá khứ, thì hàm này trả về giá của tổng 4 cái còn lại)
    public Double getRemainingAmountOfRecurringByBookingId(String bookingId);

    public ResponseEntity<BaseResponse> getRecurringBookingByContainBookingId(String bookingId);

    public ResponseEntity<BaseResponse> searchByFieldNameAndPaginate(String fieldName, int page, int size);

    public Map<String, Double> getRevenueLastSixMonths();

    public ResponseEntity<BaseResponse> allBookingUser(String userId);

    // UPDATE
    // soft delete & restore
    public ResponseEntity<BaseResponse> changeIsDeleted(String bookingId, boolean flag);

    public ResponseEntity<BaseResponse> forceDelete(String bookingId);

    public List<BookingData> exportData();
}
