package app.sportcenter.services;

import app.sportcenter.models.dto.request.VNPayRequest;
import app.sportcenter.models.dto.response.VnpayResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface PaymentService {

    public VnpayResponse createPayment(HttpServletRequest request, VNPayRequest vnPayRequest);

    public void paymentSuccessCallback(String amount, String orderInfo);

    public void paymentFailed(String orderInfo);
}
