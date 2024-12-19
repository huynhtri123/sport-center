package app.sportcenter.services;

import app.sportcenter.models.dto.InvoiceRequest;
import app.sportcenter.models.dto.InvoiceResponse;

import java.util.List;
import java.util.Map;

public interface InvoiceService {
    public InvoiceResponse create(InvoiceRequest invoiceRequest);
    public List<InvoiceResponse> getAllActive();
    public List<InvoiceResponse> myInvoices();
    public InvoiceResponse toggleDelete(String invoiceId, boolean flag);
    public InvoiceResponse forceDelete(String invoiceId);
    Map<String, Double> getRevenueLastSixMonths();
}
