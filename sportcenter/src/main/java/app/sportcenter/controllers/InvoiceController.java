package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.InvoiceRequest;
import app.sportcenter.models.dto.InvoiceResponse;
import app.sportcenter.services.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoice")
public class InvoiceController {
    @Autowired
    private InvoiceService invoiceService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody InvoiceRequest invoiceRequest) {
        InvoiceResponse response = invoiceService.create(invoiceRequest);
        return ResponseEntity.ok(new BaseResponse(
                "Tạo mới invoice thành công", HttpStatus.OK.value(), response
        ));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/getAllActive")
    public ResponseEntity<BaseResponse> getAllActive() {
        return ResponseEntity.ok(
                new BaseResponse("Lấy danh sách hoá đơn đang hoạt động thành công",
                        HttpStatus.OK.value(),
                        invoiceService.getAllActive())
        );
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER')")
    @GetMapping("/myInvoices")
    public ResponseEntity<BaseResponse> myInvoices() {
        return ResponseEntity.ok(
                new BaseResponse("Lấy danh sách booking của người dùng hiện tại thành công",
                        HttpStatus.OK.value(), invoiceService.myInvoices())
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/softDelete/{invoiceId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable("invoiceId") String invoiceId) {
        boolean newIsDeleted = true;
        InvoiceResponse response = invoiceService.toggleDelete(invoiceId, newIsDeleted);
        return ResponseEntity.ok(
                new BaseResponse("Xoá mềm invoice thành công!", HttpStatus.OK.value(), response)
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/restore/{invoiceId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable("invoiceId") String invoiceId) {
        boolean newIsDeleted = false;
        InvoiceResponse response = invoiceService.toggleDelete(invoiceId, newIsDeleted);
        return ResponseEntity.ok(
                new BaseResponse("Khôi phục invoice thành công!", HttpStatus.OK.value(), response)
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @DeleteMapping("/forceDelete/{invoiceId}")
    public ResponseEntity<BaseResponse> forceDelete(@PathVariable("invoiceId") String invoiceId) {
        InvoiceResponse response = invoiceService.forceDelete(invoiceId);
        return ResponseEntity.ok(
                new BaseResponse("Xoá cứng invoice thành công!", HttpStatus.OK.value(), response)
        );
    }

}
