package app.sportcenter.services;

import app.sportcenter.models.dto.VNPayRequest;
import app.sportcenter.models.dto.VnpayResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface PaymentService {

    public VnpayResponse createPayment(HttpServletRequest request, VNPayRequest vnPayRequest);

    public void paymentSuccessCallback(String amount, String orderInfo);

    public void paymentFailed(String orderInfo);
}
