package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.request.InvoiceRequest;
import app.sportcenter.models.dto.response.InvoiceResponse;
import app.sportcenter.services.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/invoice")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService invoiceService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody InvoiceRequest invoiceRequest) {
        InvoiceResponse response = invoiceService.create(invoiceRequest);
        return ResponseEntity.ok(new BaseResponse(
                "Create new invoice successfully!", HttpStatus.OK.value(), response
        ));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/all-active")
    public ResponseEntity<BaseResponse> getAllActive() {
        return ResponseEntity.ok(
                new BaseResponse("Get invoices successfully!",
                        HttpStatus.OK.value(),
                        invoiceService.getAllActive())
        );
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER')")
    @GetMapping("/my-invoices")
    public ResponseEntity<BaseResponse> myInvoices() {
        return ResponseEntity.ok(
                new BaseResponse("Get current user's invoices successfully!",
                        HttpStatus.OK.value(), invoiceService.myInvoices())
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/soft-delete/{invoiceId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable("invoiceId") String invoiceId) {
        boolean newIsDeleted = true;
        InvoiceResponse response = invoiceService.toggleDelete(invoiceId, newIsDeleted);
        return ResponseEntity.ok(
                new BaseResponse("Soft deleted invoice successfully!!", HttpStatus.OK.value(), response)
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/restore/{invoiceId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable("invoiceId") String invoiceId) {
        boolean newIsDeleted = false;
        InvoiceResponse response = invoiceService.toggleDelete(invoiceId, newIsDeleted);
        return ResponseEntity.ok(
                new BaseResponse("Restore invoice successfully!", HttpStatus.OK.value(), response)
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @DeleteMapping("/force-delete/{invoiceId}")
    public ResponseEntity<BaseResponse> forceDelete(@PathVariable("invoiceId") String invoiceId) {
        InvoiceResponse response = invoiceService.forceDelete(invoiceId);
        return ResponseEntity.ok(
                new BaseResponse("Force deleted invoice successfully!", HttpStatus.OK.value(), response)
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/revenue/last-six-months")
    public ResponseEntity<BaseResponse> getRevenueLastSixMonths(
            @RequestParam(value = "year", required = false) Integer year) {

        // Nếu frontend không gửi year, dùng năm hiện tại
        if (year == null) {
            year = LocalDate.now().getYear();
        }

        Map<String, Map<String, Double>> revenueData = invoiceService.getRevenueForYear(year);
        return ResponseEntity.ok(
                new BaseResponse("Revenue in year " + year, HttpStatus.OK.value(), revenueData)
        );
    }

}
