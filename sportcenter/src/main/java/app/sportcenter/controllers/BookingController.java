package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.BookingRequest;
import app.sportcenter.models.dto.OnDayScheduleRequest;
import app.sportcenter.models.dto.RecurringBookingRequest;
import app.sportcenter.models.dto.TimeRequest;
import app.sportcenter.services.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;


@RestController
@RequestMapping("/api")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PreAuthorize("hasAnyAuthority('CUSTOMER')")
    @PostMapping("/booking/create")
    public ResponseEntity<BaseResponse> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        return bookingService.createBooking(bookingRequest);
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PutMapping("/booking/confirm/{bookingId}")
    public ResponseEntity<BaseResponse> confirmBooking(@PathVariable("bookingId") String bookingId) {
        return bookingService.confirmBooking(bookingId);
    }


    @PreAuthorize("hasAnyAuthority('CUSTOMER')")
    @PostMapping("/booking/createRecurring")
    public ResponseEntity<BaseResponse> createRecurringBooking(
            @Valid @RequestBody RecurringBookingRequest recurringBookingRequest) {
        return bookingService.createRecurringBooking(recurringBookingRequest);
    }

    // lấy giá đặt sân lẻ
    @PreAuthorize("hasAnyAuthority('CUSTOMER')")
    @PostMapping("/booking/getBookingPrice")
    public ResponseEntity<BaseResponse> getBookingPrice(@Valid @RequestBody BookingRequest bookingRequest) {
        Double price = bookingService.getBookingPrice(bookingRequest);
        return ResponseEntity.ok(
                new BaseResponse("Lấy giá booking thành công!", HttpStatus.OK.value(), price)
        );
    }

    // lấy giá đặt sân theo lịch cứng
    @PreAuthorize("hasAnyAuthority('CUSTOMER')")
    @PostMapping("/booking/getRecurringBookingPrice")
    public ResponseEntity<BaseResponse> getRecurringBookingPrice(
            @Valid @RequestBody RecurringBookingRequest recurringBookingRequest) {
        Double price = bookingService.getRecurringBookingPrice(recurringBookingRequest);
        return ResponseEntity.ok(
                new BaseResponse("Lấy giá recurring booking thành công!", HttpStatus.OK.value(), price)
        );
    }

    // lấy RecurringBooking nào có chứa bookingId (tìm chủ nhân của booking kiểu recurring)
    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @GetMapping("/recurring/getByBookingId")
    public ResponseEntity<BaseResponse> getRecurringBookingByContainBookingId(
            @RequestParam("bookingId") String bookingId) {
        return bookingService.getRecurringBookingByContainBookingId(bookingId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<BaseResponse> getBookingById(@PathVariable String bookingId) {
        return bookingService.getBookingById(bookingId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/booking/getByUserId/{userId}")
    public ResponseEntity<BaseResponse> getByUserId(@PathVariable String userId) {
        return bookingService.getBookingByUserId(userId);
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER')")
    @GetMapping("/booking/myBookings/{userId}")
    public ResponseEntity<BaseResponse> getCurrentBookingsOfCurrentUser(@PathVariable String userId) {
        return bookingService.getCurrentBookingsOfCurrentUser(userId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/booking/getByFieldId/{fieldId}")
    public ResponseEntity<BaseResponse> getByFieldId(@PathVariable String fieldId) {
        return bookingService.getBookingByFieldId(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/booking/byStartTime/{startTime}")
    public ResponseEntity<BaseResponse> getBookingsByStartTime(@PathVariable("startTime") ZonedDateTime startTime) {
        return bookingService.getBookingsByStartTime(startTime);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/booking/getAllActive")
    public ResponseEntity<BaseResponse> getBookingsByStartTime(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return bookingService.getAllBookings(page, size);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/booking/softDelete/{bookingId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable String bookingId) {
        boolean newIsDeleted = true;
        return bookingService.changeIsDeleted(bookingId, newIsDeleted);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/booking/restore/{bookingId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable String bookingId) {
        boolean newIsDeleted = false;
        return bookingService.changeIsDeleted(bookingId, newIsDeleted);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/booking/forceDelete/{bookingId}")
    public ResponseEntity<BaseResponse> forceDelete(@PathVariable String bookingId) {
        return bookingService.forceDelete(bookingId);
    }

    // lấy tất cả booking theo khoảng thời gian cụ thể. Ví dụ theo ngày (7:00 ngày 1/1/2024 - 22:00 ngày 1/1/2024)
    // public
    @PutMapping("/public/booking/updateAndGetSchedule")
    public ResponseEntity<BaseResponse> getFieldSchedule(@Valid @RequestBody OnDayScheduleRequest onDayScheduleRequest) {
        String fieldId = onDayScheduleRequest.getFieldId();
        ZonedDateTime startOfDay = onDayScheduleRequest.getStartOfDay();
        ZonedDateTime endOfDay = onDayScheduleRequest.getEndOfDay();
        return bookingService.getFieldSchedule(fieldId, startOfDay, endOfDay);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/booking/cancel/{bookingId}")
    public ResponseEntity<BaseResponse> cancelBooking(@PathVariable("bookingId") String bookingId) {
        return bookingService.cancelBooking(bookingId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/recurring/cancel/{bookingId}")
    public ResponseEntity<BaseResponse> cancelRecurringByBookingId(@PathVariable("bookingId") String bookingId) {
        return bookingService.cancelRecurringByBookingId(bookingId);
    }

}
