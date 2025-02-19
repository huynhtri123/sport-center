package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.response.CloudinaryResponse;
import app.sportcenter.models.dto.request.PaymentRequest;
import app.sportcenter.models.dto.request.UserRequest;
import app.sportcenter.services.CloudinaryService;
import app.sportcenter.services.UserService;
import app.sportcenter.utils.file.FileUploadUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final CloudinaryService cloudinaryService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/user/update-profile")
    public ResponseEntity<BaseResponse> updateCurrentUser(@RequestPart("userRequest") @Valid UserRequest userRequest,
                                                          @RequestPart(name = "file", required = false) MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            FileUploadUtil.assertAllowedImage(file);
            final String fileName = FileUploadUtil.getFileName(file.getOriginalFilename());
            final CloudinaryResponse response = cloudinaryService.uploadFile(file, fileName);

            userRequest.setAvatarUrl(response.getUrl());
        }

        return userService.updateInfoCurrentUser(userRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/user/my-profile")
    public ResponseEntity<BaseResponse> getCurrentProfile() {
        return userService.getCurrentProfile();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/user/all-active")
    public ResponseEntity<BaseResponse> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return userService.getAll(page, size);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/user/soft-delete/{userId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable String userId) {
        return userService.softDelete(userId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/user/add-payment/{userId}")
    public ResponseEntity<BaseResponse> addPaymentInfo(@PathVariable String userId, @Valid @RequestBody PaymentRequest paymentRequest) {
        return userService.addPaymentInfoToUser(userId, paymentRequest);
    }

    @DeleteMapping("/user/payment/{userId}/{paymentInfoId}")
    public ResponseEntity<BaseResponse> removePaymentInfoFromUser(@PathVariable String userId, @PathVariable String paymentInfoId) {
        return userService.removePaymentInfoFromUser(userId, paymentInfoId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/user/update-payment/{userId}/{paymentInfoId}")
    public ResponseEntity<BaseResponse> updatePaymentInfo(@PathVariable String userId, @PathVariable String paymentInfoId, @Valid @RequestBody PaymentRequest paymentRequest) {
        return userService.updatePaymentInfoForUser(userId, paymentInfoId, paymentRequest);
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @GetMapping("/user/account-balance")
    public ResponseEntity<BaseResponse> getAccountBalance() {
        return userService.getAccountBalance();
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PatchMapping("/user/balance-pay")
    public ResponseEntity<BaseResponse> makePaymentByBalance(@RequestParam Double amountToPay,
                                                             @RequestParam String transactionType) {
        return ResponseEntity.ok(
                new BaseResponse("Payment using balance was successful!", HttpStatus.OK.value(),
                        userService.makePaymentByBalance(amountToPay, transactionType)));
    }

    // public (check by coookie)
    @GetMapping("/public/user/current-user")
    public ResponseEntity<BaseResponse> getCurrentUser(HttpServletRequest request) {
        return ResponseEntity.ok(
                new BaseResponse("Get current user info successfully!",
                        HttpStatus.OK.value(),
                        userService.getCurrentUser(request))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<BaseResponse> getUserById(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(
                new BaseResponse("Find user by id successfully",
                        HttpStatus.OK.value(),
                        userService.getUserById(userId))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/user/my-invoices")
    public ResponseEntity<BaseResponse> getInvoicesForCurrentUser() {
        return userService.getInvoicesForCurrentUser();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @DeleteMapping("/user/my-invoices/{invoiceId}")
    public ResponseEntity<BaseResponse> deleteInvoice(@PathVariable String invoiceId) {
        try {
            // Call the service to delete the invoice
            userService.deleteInvoice(invoiceId);

            // Return 204 No Content status, no need for a response body
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new BaseResponse("Failed to delete invoice", HttpStatus.INTERNAL_SERVER_ERROR.value(), null));
        }
    }

}
