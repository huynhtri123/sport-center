package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.RecurringIntervalType;
import app.sportcenter.services.RevenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/revenue")
public class RevenueController {
    @Autowired
    private RevenueService revenueService;

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/countSingleBooking")
    public ResponseEntity<BaseResponse> countSingleBooking() {
        int result = revenueService.countBookingByType(false);
        return ResponseEntity.ok(
                new BaseResponse("Đếm số lượng booking lẻ thành công", HttpStatus.OK.value(), result)
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/countRecurringBooking")
    public ResponseEntity<BaseResponse> countRecurringBooking() {
        int result = revenueService.countRecurringBooking();
        return ResponseEntity.ok(
                new BaseResponse("Đếm số lượng recurring booking thành công", HttpStatus.OK.value(), result)
        );
    }

    // đếm số lượng recurring theo chu kì (ví dụ: đếm xem có bao nhiêu booking đặt theo kiểu WEEKLY, DAILY)
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/countRecurringBookingByType")
    public ResponseEntity<BaseResponse> countRecurringBookingByType(@RequestParam("type") RecurringIntervalType type) {
        int result = revenueService.countRecurringByType(type);
        return ResponseEntity.ok(
                new BaseResponse("Đếm số lượng recurring booking theo loại chu kì thành công", HttpStatus.OK.value(), result)
        );
    }

}
