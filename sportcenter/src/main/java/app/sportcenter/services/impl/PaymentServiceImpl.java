package app.sportcenter.services.impl;

import app.sportcenter.commons.PaymentMethod;
import app.sportcenter.commons.PaymentStatus;
import app.sportcenter.commons.TransactionType;
import app.sportcenter.configs.vnpay.VNPayConfig;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.request.InvoiceRequest;
import app.sportcenter.models.dto.request.VNPayRequest;
import app.sportcenter.models.dto.response.*;
import app.sportcenter.models.entities.RecurringBooking;
import app.sportcenter.repositories.RecurringBookingRepository;
import app.sportcenter.services.*;
import app.sportcenter.utils.vnpay.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final VNPayConfig vnpayConfig;
    private final UserService userService;
    private final InvoiceService invoiceService;
    private final BookingService bookingService;
    private final RecurringBookingRepository recurringBookingRepository;
    private final TournamentService tournamentService;

    @Override
    public VnpayResponse createPayment(HttpServletRequest request, VNPayRequest vnPayRequest) {

        String vnp_TxnRef = VNPayUtil.getRandomNumber(8);
        String vnp_IpAddr = VNPayUtil.getIpAddress(request);

        Map<String, String> vnp_Params = buildParams(vnp_TxnRef, vnp_IpAddr, vnPayRequest);

        String paymentUrl = buildPaymentUrl(vnp_Params);

        VnpayResponse vnpayResponse = new VnpayResponse();
        vnpayResponse.setStatus("Ok");
        vnpayResponse.setMessage("Successfully");
        vnpayResponse.setURL(paymentUrl);

        return vnpayResponse;
    }

    private Map<String, String> buildParams(String vnp_TxnRef, String vnp_IpAddr, VNPayRequest vnPayRequest) {
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnpayConfig.getVersion());
        vnp_Params.put("vnp_Command", vnpayConfig.getCommand());
        vnp_Params.put("vnp_TmnCode", vnpayConfig.getTmnCode());

        long amount = (long) (vnPayRequest.getAmount() * 100L);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));

        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", "NCB");
        vnp_Params.put("vnp_OrderType", vnpayConfig.getOrderType());
        vnp_Params.put("vnp_ReturnUrl", vnpayConfig.getReturnUrl());

        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);

        vnp_Params.put("vnp_OrderInfo", formatOrderInfo(vnPayRequest.getUserId(),
                vnPayRequest.getTransactionType(),
                vnPayRequest.getAmountByBalance(),
                vnPayRequest.getBookingId(),
                vnPayRequest.getRegisterOrderId()));

        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 5);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        System.out.println(vnp_Params);

        return vnp_Params;
    }

    private String formatOrderInfo(String userId, TransactionType transactionType, Double amountByBalance,
                                   String bookingId, String registerOrderId) {
        // amountByBalance có phần thập phân .0, loại bỏ nó
        String amountByBalanceStr = String.format("%.0f", amountByBalance);
        return  userId + "|" + transactionType.name() + "|" + amountByBalanceStr + "|" + bookingId + "|" + registerOrderId;
    }

    private String buildPaymentUrl(Map<String, String> vnp_Params) {
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                // Build hash data
                hashData.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));

                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));

                query.append('&');
                hashData.append('&');
            }
        }

        if (!query.isEmpty()) query.setLength(query.length() - 1);
        if (!hashData.isEmpty()) hashData.setLength(hashData.length() - 1);

        String vnp_SecureHash = VNPayUtil.hmacSHA512(vnpayConfig.getSecretKey(), hashData.toString());
        return vnpayConfig.getPayUrl() + "?" + query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;
    }

    @Override
    public void paymentSuccessCallback(String amount, String orderInfo) {
        String[] orderInfoParts = orderInfo.split("\\|");
        if (orderInfoParts.length != 5) {
            throw new CustomException("Invalid order info format!", HttpStatus.BAD_REQUEST.value());
        }

        String userId = orderInfoParts[0];
        String transactionType = orderInfoParts[1].toUpperCase();
        String amountByBalance = orderInfoParts[2];
        String bookingId = orderInfoParts[3];
        String registerOrderId = orderInfoParts[4];

//        log.error("userID: {}", userId);
//        log.error("transactionType: {}", transactionType);
//        log.error("amount by balance: {}", amountByBalance);
//        log.error("bookingID: {}", bookingId);
//        log.error("registerOrderId: {}", registerOrderId);

        // dat san buoc 2 (neu la booking)
        if (TransactionType.valueOf(transactionType) == TransactionType.BOOKING && bookingId != null) {
            RecurringBooking recurringBooking = recurringBookingRepository.findById(bookingId).orElse(null);
            if (recurringBooking == null) {
                // is Booking
                BookingResponse bookingResponse = bookingService.confirmBooking(bookingId);
            } else {
                // is Recurring
                RecurringBookingResponse recurringResponse = bookingService.confirmRecurringBooking(bookingId);
            }
        }
        // register (neu la tournament)
        if (TransactionType.valueOf(transactionType) == TransactionType.REGISTRATION_FEE && registerOrderId != null) {
            TournamentResponse tournamentResponse = tournamentService.confirmRegister(registerOrderId);
        }

        // thanh toan = balance (neu co)
        double amountBalance = Double.parseDouble(amountByBalance);
        if (amountBalance != 0) {
            InvoiceResponse invoiceBalanceResponse = userService.makePaymentByBalance(amountBalance, transactionType);
        }

        // tao hoa don (card)
        InvoiceRequest invoiceRequest = new InvoiceRequest();
        invoiceRequest.setUserId(userId);
        invoiceRequest.setAmount(Double.parseDouble(amount) / 100);
        invoiceRequest.setPaymentMethod(PaymentMethod.CARD);
        invoiceRequest.setPaymentStatus(PaymentStatus.PAID);
        invoiceRequest.setTransactionType(TransactionType.valueOf(transactionType));
        InvoiceResponse invoiceResponse = invoiceService.create(invoiceRequest);
    }

    @Override
    public void paymentFailed(String orderInfo) {
        log.error("Payment with vnpay failed! Order info: {}" , orderInfo);
    }

}
