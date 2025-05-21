package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.request.BookingRequest;
import app.sportcenter.models.dto.request.OnDayScheduleRequest;
import app.sportcenter.models.dto.request.RecurringBookingRequest;
import app.sportcenter.models.dto.response.BookingResponse;
import app.sportcenter.models.dto.response.RecurringBookingResponse;
import app.sportcenter.services.BookingService;
import app.sportcenter.services.FieldStatusByDateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.Map;


@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;
    private final SimpMessagingTemplate messagingTemplate;
    private final FieldStatusByDateService fieldStatusByDateService;

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PostMapping("/booking/create")
    public ResponseEntity<BaseResponse> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        BookingResponse bookingResponse = bookingService.createBooking(bookingRequest);
        // websocket: send notification
        //messagingTemplate.convertAndSend("/topic/booking-updates", Map.of("message", "Update field status!"));

        return ResponseEntity.ok(
                new BaseResponse("Success, please make the payment to confirm your booking!", 200,
                        bookingResponse)
        );
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PutMapping("/booking/confirm/{bookingId}")
    public ResponseEntity<BaseResponse> confirmBooking(@PathVariable("bookingId") String bookingId) {
        BookingResponse bookingResponse = bookingService.confirmBooking(bookingId);
        messagingTemplate.convertAndSend("/topic/booking-updates", Map.of("message", "Update field status!"));

        return ResponseEntity.ok(
                new BaseResponse("Court booking confirmed successfully.", 200,
                        bookingResponse)
        );
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PostMapping("/recurring/create")
    public ResponseEntity<BaseResponse> createRecurringBooking(
            @Valid @RequestBody RecurringBookingRequest recurringBookingRequest) {
        RecurringBookingResponse response = bookingService.createRecurringBooking(recurringBookingRequest);
        messagingTemplate.convertAndSend("/topic/booking-updates", Map.of("message", "Update field status!"));

        return ResponseEntity.ok(
                new BaseResponse("Success, please make the payment to confirm your court booking!", 200, response)
        );
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PutMapping("/recurring/confirm/{recurringBookingId}")
    public ResponseEntity<BaseResponse> confirmRecurring(@PathVariable("recurringBookingId") String recurringBookingId) {
        RecurringBookingResponse response = bookingService.confirmRecurringBooking(recurringBookingId);
        messagingTemplate.convertAndSend("/topic/booking-updates", Map.of("message", "Update field status!"));

        String message = "Confirm recurring booking successfully!";
        return ResponseEntity.ok(
                new BaseResponse(message, 200, response)
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/booking/cancel/{bookingId}")
    public ResponseEntity<BaseResponse> cancelBooking(@PathVariable("bookingId") String bookingId) {
        BookingResponse response = bookingService.cancelBooking(bookingId);
        messagingTemplate.convertAndSend("/topic/booking-updates", Map.of("message", "Update field status!"));

        return ResponseEntity.ok(
                new BaseResponse("Court booking canceled successfully.", 200, response)
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/recurring/cancel/{bookingId}")
    public ResponseEntity<BaseResponse> cancelRecurringByBookingId(@PathVariable("bookingId") String bookingId) {
        RecurringBookingResponse response = bookingService.cancelRecurringByBookingId(bookingId);
        messagingTemplate.convertAndSend("/topic/booking-updates", Map.of("message", "Update field status!"));

        return ResponseEntity.ok(
                new BaseResponse("Cancel recurring booking successful",
                        200, response)
        );
    }

    // lấy tất cả booking theo khoảng thời gian cụ thể. Ví dụ theo ngày (7:00 ngày 1/1/2024 - 22:00 ngày 1/1/2024)
    // public
    @PutMapping("/public/booking/update-and-get-schedule")
    public ResponseEntity<BaseResponse> getFieldSchedule(@Valid @RequestBody OnDayScheduleRequest onDayScheduleRequest) {
        String fieldId = onDayScheduleRequest.getFieldId();
        ZonedDateTime startOfDay = onDayScheduleRequest.getStartOfDay();
        ZonedDateTime endOfDay = onDayScheduleRequest.getEndOfDay();
        return bookingService.getFieldSchedule(fieldId, startOfDay, endOfDay);
    }

    // lấy giá đặt sân lẻ
    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PostMapping("/booking/price")
    public ResponseEntity<BaseResponse> getBookingPrice(@Valid @RequestBody BookingRequest bookingRequest) {
        Double price = bookingService.getBookingPrice(bookingRequest);
        return ResponseEntity.ok(
                new BaseResponse("Lấy giá booking thành công!", HttpStatus.OK.value(), price)
        );
    }

    // lấy giá đặt sân theo lịch cứng
    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PostMapping("/recurring/price")
    public ResponseEntity<BaseResponse> getRecurringBookingPrice(
            @Valid @RequestBody RecurringBookingRequest recurringBookingRequest) {
        Double price = bookingService.getRecurringBookingPrice(recurringBookingRequest);
        return ResponseEntity.ok(
                new BaseResponse("Lấy giá recurring booking thành công!", HttpStatus.OK.value(), price)
        );
    }

    // lấy RecurringBooking nào có chứa bookingId (tìm chủ nhân của booking kiểu recurring)
    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @GetMapping("/recurring/by-booking")
    public ResponseEntity<BaseResponse> getRecurringBookingByContainBookingId(
            @RequestParam("bookingId") String bookingId) {
        return bookingService.getRecurringBookingByContainBookingId(bookingId);
    }

    // lay danh sach time slots se chiem
    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PostMapping("/recurring/timeSlots")
    public ResponseEntity<BaseResponse> getTimeSlots(@Valid @RequestBody RecurringBookingRequest recurringBookingRequest) {
        return ResponseEntity.ok(
                new BaseResponse("Get recurring time slots successfully!", 200,
                        bookingService.getTimeSlotsForRecurring(recurringBookingRequest))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<BaseResponse> getBookingById(@PathVariable String bookingId) {
        return bookingService.getBookingById(bookingId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/booking/by-user/{userId}")
    public ResponseEntity<BaseResponse> getByUserId(@PathVariable String userId) {
        return bookingService.getBookingByUserId(userId);
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @GetMapping("/booking/my-bookings")
    public ResponseEntity<BaseResponse> getCurrentBookingsOfCurrentUser(
            @RequestParam(value = "year", required = false) Integer year) {

        return bookingService.getCurrentBookingsOfCurrentUser(year);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/booking/by-field/{fieldId}")
    public ResponseEntity<BaseResponse> getByFieldId(@PathVariable String fieldId) {
        return bookingService.getBookingByFieldId(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/booking/start-time/{startTime}")
    public ResponseEntity<BaseResponse> getBookingsByStartTime(@PathVariable("startTime") ZonedDateTime startTime) {
        return bookingService.getBookingsByStartTime(startTime);
    }

    @GetMapping("/booking/all-active")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<BaseResponse> getAllActive(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "" + Integer.MAX_VALUE) int size) {
        return bookingService.getAllActiveBookings(page, size);
    }

    @GetMapping("/booking/all")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<BaseResponse> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "" + Integer.MAX_VALUE) int size) {
        return bookingService.getAllBookings(page, size);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/booking/soft-delete/{bookingId}")
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
    @DeleteMapping("/booking/force-delete/{bookingId}")
    public ResponseEntity<BaseResponse> forceDelete(@PathVariable String bookingId) {
        return bookingService.forceDelete(bookingId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/recurring/remaining-price/{bookingId}")
    public ResponseEntity<BaseResponse> getRemainingAmountOfRecurringByBookingId(@PathVariable("bookingId") String bookingId) {
        return ResponseEntity.ok(
                new BaseResponse("Lấy giá còn lại của Recurring thành công", HttpStatus.OK.value(),
                        bookingService.getRemainingAmountOfRecurringByBookingId(bookingId))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/booking/search-by-field-name")
    public ResponseEntity<BaseResponse> searchByFieldNameAndPaginate(
            @RequestParam("fieldName") String fieldName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return bookingService.searchByFieldNameAndPaginate(fieldName, page, size);
    }

    @GetMapping("/booking/search-by-user-name")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<BaseResponse> searchBookings(
            @RequestParam(required = false) String userName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        return bookingService.searchByUserName(userName, page, size);
    }


    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/booking/revenue/last-six-months")
    public ResponseEntity<BaseResponse> getRevenueLastSixMonths() {
        Map<String, Double> revenueData = bookingService.getRevenueLastSixMonths();
        return ResponseEntity.ok(new BaseResponse("Lấy doanh thu thành công!", HttpStatus.OK.value(), revenueData));
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @GetMapping("/booking/all-bookings/{userId}")
    public ResponseEntity<BaseResponse> allBookingUser(@PathVariable String userId) {
        return bookingService.allBookingUser(userId);
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PostMapping("/booking/check")
    public ResponseEntity<BaseResponse> check(@Valid @RequestBody BookingRequest bookingRequest) {
        String fieldId = bookingRequest.getFieldId();
        ZonedDateTime startTime = bookingRequest.getStartTime();
        ZonedDateTime endTime = startTime.plusHours(bookingRequest.getNumberOfHours());

        return ResponseEntity.ok(
                new BaseResponse("Check single booking ok", 200, fieldStatusByDateService.checkAvailable(
                        fieldId, startTime, endTime
                ))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/booking/export-data")
    public ResponseEntity<BaseResponse> exportData() {
        return ResponseEntity.ok(
                new BaseResponse("Get all bookings for AI successfully", 200,
                        bookingService.exportData().size())
        );
    }
}
