package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.CloudinaryResponse;
import app.sportcenter.models.dto.PaymentRequest;
import app.sportcenter.models.dto.UserRequest;
import app.sportcenter.models.entities.PaymentInfo;
import app.sportcenter.services.CloudinaryService;
import app.sportcenter.services.UserService;
import app.sportcenter.utils.FileUploadUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private CloudinaryService cloudinaryService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/updateProfile")
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
    @GetMapping("/myProfile")
    public ResponseEntity<BaseResponse> getCurrentProfile() {
        return userService.getCurrentProfile();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/getAllActive")
    public ResponseEntity<BaseResponse> getAll() {
        return userService.getAll();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/softDelete/{userId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable String userId) {
        return userService.softDelete(userId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/addPayment/{userId}")
    public ResponseEntity<BaseResponse> addPaymentInfo(@PathVariable String userId, @Valid @RequestBody PaymentRequest paymentRequest) {
        return userService.addPaymentInfoToUser(userId, paymentRequest);
    }

    @DeleteMapping("/deletePayment/{userId}/{paymentInfoId}")
    public ResponseEntity<BaseResponse> removePaymentInfoFromUser(@PathVariable String userId, @PathVariable String paymentInfoId) {
        return userService.removePaymentInfoFromUser(userId, paymentInfoId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/updatePayment/{userId}/{paymentInfoId}")
    public ResponseEntity<BaseResponse> updatePaymentInfo(@PathVariable String userId, @PathVariable String paymentInfoId, @Valid @RequestBody PaymentRequest paymentRequest) {
        return userService.updatePaymentInfoForUser(userId, paymentInfoId, paymentRequest);
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @GetMapping("/getAccountBalance")
    public ResponseEntity<BaseResponse> getAccountBalance() {
        return userService.getAccountBalance();
    }

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PatchMapping("/balance-pay")
    public ResponseEntity<BaseResponse> makePaymentByBalance(@RequestParam Double amountToPay,
                                                             @RequestParam String transactionType) {
        return ResponseEntity.ok(
                new BaseResponse("Payment using balance was successful!", HttpStatus.OK.value(),
                        userService.makePaymentByBalance(amountToPay, transactionType)));
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/getCurrentUser")
    public ResponseEntity<BaseResponse> getCurrentUser() {
        return ResponseEntity.ok(
                new BaseResponse("Lấy thông tin người dùng hiện tại thành công",
                        HttpStatus.OK.value(),
                        userService.getCurrentUser())
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/getUserById/{userId}")
    public ResponseEntity<BaseResponse> getUserById(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(
                new BaseResponse("Find user by id successfully",
                        HttpStatus.OK.value(),
                        userService.getUserById(userId))
        );
    }

}
