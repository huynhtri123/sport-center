package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.RecurringIntervalType;
import app.sportcenter.services.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/revenue")
@RequiredArgsConstructor
public class RevenueController {
    private final RevenueService revenueService;

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/count-single-booking")
    public ResponseEntity<BaseResponse> countSingleBooking() {
        int result = revenueService.countBookingByType(false);
        return ResponseEntity.ok(
                new BaseResponse("Count the number of successful individual bookings!", HttpStatus.OK.value(), result)
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/count-recurring")
    public ResponseEntity<BaseResponse> countRecurringBooking() {
        int result = revenueService.countRecurringBooking();
        return ResponseEntity.ok(
                new BaseResponse("Count the number of successful recurring bookings!", HttpStatus.OK.value(), result)
        );
    }

    // đếm số lượng recurring theo chu kì (ví dụ: đếm xem có bao nhiêu booking đặt theo kiểu WEEKLY, DAILY)
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/count-recurring-by-type")
    public ResponseEntity<BaseResponse> countRecurringBookingByType(@RequestParam("type") RecurringIntervalType type) {
        int result = revenueService.countRecurringByType(type);
        return ResponseEntity.ok(
                new BaseResponse("Count the number of successful recurring bookings by recurrence type!", HttpStatus.OK.value(), result)
        );
    }

}
