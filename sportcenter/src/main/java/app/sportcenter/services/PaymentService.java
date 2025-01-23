package app.sportcenter.services;

import app.sportcenter.models.dto.InvoiceRequest;
import app.sportcenter.models.dto.VNPayRequest;
import app.sportcenter.models.dto.VnpayResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface PaymentService {
    public VnpayResponse createPayment(HttpServletRequest request, VNPayRequest vnPayRequest);
}
