package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.BookingRequest;
import app.sportcenter.services.BookingService;
import jakarta.servlet.ServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;


@RestController
@RequestMapping("/api/booking")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        return bookingService.createBooking(bookingRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/{bookingId}")
    public ResponseEntity<BaseResponse> getBookingById(@PathVariable String bookingId) {
        return bookingService.getBookingById(bookingId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/getByUserId/{userId}")
    public ResponseEntity<BaseResponse> getByUserId(@PathVariable String userId) {
        return bookingService.getBookingByUserId(userId);
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER')")
    @GetMapping("/myBookings/{userId}")
    public ResponseEntity<BaseResponse> getCurrentBookingsOfCurrentUser(@PathVariable String userId) {
        return bookingService.getCurrentBookingsOfCurrentUser(userId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/getByFieldId/{fieldId}")
    public ResponseEntity<BaseResponse> getByFieldId(@PathVariable String fieldId) {
        return bookingService.getBookingByFieldId(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/byStartTime/{startTime}")
    public ResponseEntity<BaseResponse> getBookingsByStartTime(@PathVariable("startTime") ZonedDateTime startTime) {
        return bookingService.getBookingsByStartTime(startTime);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/getAllActive")
    public ResponseEntity<BaseResponse> getBookingsByStartTime() {
        return bookingService.getAllBookings();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/softDelete/{bookingId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable String bookingId) {
        boolean newIsDeleted = true;
        return bookingService.changeIsDeleted(bookingId, newIsDeleted);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/restore/{bookingId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable String bookingId) {
        boolean newIsDeleted = false;
        return bookingService.changeIsDeleted(bookingId, newIsDeleted);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/forceDelete/{bookingId}")
    public ResponseEntity<BaseResponse> forceDelete(@PathVariable String bookingId) {
        return bookingService.forceDelete(bookingId);
    }

}
