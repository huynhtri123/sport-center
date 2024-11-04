package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.BookingRequest;
import app.sportcenter.models.dto.OnDayScheduleRequest;
import app.sportcenter.models.entities.User;
import app.sportcenter.services.BookingService;
import jakarta.servlet.ServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;


@RestController
@RequestMapping("/api")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PostMapping("/booking/create")
    public ResponseEntity<BaseResponse> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        return bookingService.createBooking(bookingRequest);
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
    public ResponseEntity<BaseResponse> getBookingsByStartTime() {
        return bookingService.getAllBookings();
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

}
