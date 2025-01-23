package app.sportcenter.controllers;

import app.sportcenter.commons.PaymentMethod;
import app.sportcenter.commons.PaymentStatus;
import app.sportcenter.commons.TransactionType;
import app.sportcenter.configs.vnpay.VNPayConfig;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.InvoiceRequest;
import app.sportcenter.models.dto.InvoiceResponse;
import app.sportcenter.models.dto.VNPayRequest;
import app.sportcenter.services.InvoiceService;
import app.sportcenter.services.PaymentService;
import app.sportcenter.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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
    private final InvoiceService invoiceService;
    private final VNPayConfig vnPayConfig;
    private final UserService userService;

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PostMapping("/payment/create_payment")
    public ResponseEntity<?> createPayment(HttpServletRequest request, @RequestBody @Valid VNPayRequest vnPayRequest) {
        return ResponseEntity.ok(paymentService.createPayment(request, vnPayRequest));
    }

    @GetMapping("/payment/vnpay-callback")
    public void transaction(HttpServletResponse response,
                            @RequestParam(value = "vnp_Amount") String amount,
                            @RequestParam(value = "vnp_BankCode") String bankCode,
                            @RequestParam(value = "vnp_OrderInfo") String orderInfo,
                            @RequestParam(value = "vnp_ResponseCode") String responseCode) throws IOException {

        if (responseCode.equals("00")) {
            String[] orderInfoParts = orderInfo.split("\\.");
            if (orderInfoParts.length != 3) {
                throw new CustomException("Invalid order info format!", HttpStatus.BAD_REQUEST.value());
            }

            String userId = orderInfoParts[0];
            String transactionType = orderInfoParts[1].toUpperCase();
            String amountByBalance = orderInfoParts[2];

            try {
                double amountBalance = Double.parseDouble(amountByBalance);
                if (amountBalance != 0) {
                    InvoiceResponse invoiceBalanceResponse = userService.makePaymentByBalance(amountBalance, transactionType);
                }

                InvoiceRequest invoiceRequest = new InvoiceRequest();
                invoiceRequest.setUserId(userId);
                invoiceRequest.setAmount(Double.parseDouble(amount) / 100);
                invoiceRequest.setPaymentMethod(PaymentMethod.CARD);
                invoiceRequest.setPaymentStatus(PaymentStatus.PAID);
                invoiceRequest.setTransactionType(TransactionType.valueOf(transactionType));
                InvoiceResponse invoiceResponse = invoiceService.create(invoiceRequest);
                //System.out.println(userId + "|" + transactionType);
            } catch (Exception e) {
                log.error("Create invoice failed! Payment with vnpay failed!");
                response.sendRedirect(vnPayConfig.getReturnClientUrlFailed());
            }

        } else {
            log.error("Payment with vnpay failed!");
            response.sendRedirect(vnPayConfig.getReturnClientUrlFailed());
        }
        response.sendRedirect(vnPayConfig.getReturnClientUrlSuccess());

    }

}
