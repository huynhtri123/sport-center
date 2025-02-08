package app.sportcenter.controllers;

import app.sportcenter.configs.vnpay.VNPayConfig;
import app.sportcenter.models.dto.VNPayRequest;
import app.sportcenter.services.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final VNPayConfig vnPayConfig;

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PostMapping("/payment/create-payment")
    public ResponseEntity<?> createPayment(HttpServletRequest request, @RequestBody @Valid VNPayRequest vnPayRequest) {
        return ResponseEntity.ok(paymentService.createPayment(request, vnPayRequest));
    }

    @GetMapping("/payment/vnpay-callback")
    public void transaction(HttpServletResponse response,
                            @RequestParam(value = "vnp_Amount") String amount,
                            @RequestParam(value = "vnp_BankCode") String bankCode,
                            @RequestParam(value = "vnp_OrderInfo") String orderInfo,
                            @RequestParam(value = "vnp_ResponseCode") String responseCode) throws IOException {

        String redirectUrl = vnPayConfig.getReturnClientUrlFailed();

        if (responseCode.equals("00")) {
            try {
                paymentService.paymentSuccessCallback(amount, orderInfo);
                redirectUrl = vnPayConfig.getReturnClientUrlSuccess();
            } catch (Exception e) {
                log.error("Payment with vnpay failed! {}", e.getMessage());
            }

        } else {
            paymentService.paymentFailed(orderInfo);
        }
        response.sendRedirect(redirectUrl);
    }

}
