package app.sportcenter.services.impl;

import app.sportcenter.commons.Role;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.request.InvoiceRequest;
import app.sportcenter.models.dto.response.InvoiceResponse;
import app.sportcenter.models.entities.Invoice;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.InvoiceRepository;
import app.sportcenter.services.InvoiceService;
import app.sportcenter.utils.mappers.InvoiceMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceMapper invoiceMapper;

    @Override
    public InvoiceResponse create(InvoiceRequest invoiceRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) authentication.getPrincipal();
        if (invoiceRequest.getUserId().equals(currUser.getId()) || currUser.getRole().equals(Role.ADMIN)) {
            Invoice invoice = invoiceMapper.convertToEntity(invoiceRequest);
            Invoice savedInvoice = invoiceRepository.save(invoice);
            InvoiceResponse response = invoiceMapper.convertToResponse(savedInvoice);
            return response;
        } else {
            throw new CustomException("You dont have permission to create invoice for other user!",
                    HttpStatus.BAD_REQUEST.value());
        }
    }

    @Override
    public List<InvoiceResponse> getAllActive() {
        List<InvoiceResponse> responses = invoiceRepository.findByIsActiveTrueAndIsDeletedFalse()
                .stream()
                .map(invoiceMapper::convertToResponse)
                .sorted(Comparator.comparing(InvoiceResponse::getCreatedAt).reversed())
                .toList();
        return responses;
    }

    @Override
    public List<InvoiceResponse> myInvoices() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) authentication.getPrincipal();
        List<Invoice> invoices = invoiceRepository.findByUserIdAndIsActiveTrueAndIsDeletedFalse(currUser.getId());
        return invoices.stream().map(invoiceMapper::convertToResponse).toList();
    }

    @Override
    public InvoiceResponse toggleDelete(String invoiceId, boolean flag) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) authentication.getPrincipal();
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new NotFoundException("Invoice not found."));
        // admin hoặc chủ nhân moi duoc
        if (currUser.getRole().equals(Role.ADMIN) || currUser.getId().equals(invoice.getUser().getId())) {
            invoice.setIsDeleted(flag);
            Invoice updatedInvoice = invoiceRepository.save(invoice);
            InvoiceResponse response = invoiceMapper.convertToResponse(updatedInvoice);
            return response;
        } else {
            throw new CustomException("You do not have permission to perform this action on this invoice.", HttpStatus.BAD_REQUEST.value());
        }
    }

    @Override
    public InvoiceResponse forceDelete(String invoiceId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) authentication.getPrincipal();
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new NotFoundException("Invoice not found."));
        // admin hoặc chủ nhân moi duoc
        if (currUser.getRole().equals(Role.ADMIN) || currUser.getId().equals(invoice.getUser().getId())) {
            invoiceRepository.deleteById(invoiceId);
            InvoiceResponse response = invoiceMapper.convertToResponse(invoice);
            return response;
        } else {
            throw new CustomException("You do not have permission to perform this action on this invoice.", HttpStatus.BAD_REQUEST.value());
        }
    }

    @Override
    public Map<String, Double> getRevenueLastSixMonths() {
        List<Invoice> invoices = invoiceRepository.findByIsActiveTrueAndIsDeletedFalse();
        Map<String, Double> revenueData = new LinkedHashMap<>(); // Sử dụng LinkedHashMap để duy trì thứ tự
        LocalDate now = LocalDate.now();

        // Khởi tạo doanh thu cho từng tháng
        for (int i = 0; i < 6; i++) {
            LocalDate month = now.minusMonths(i);
            String monthKey = month.getMonth().name() + " " + month.getYear();
            revenueData.put(monthKey, 0.0); // Khởi tạo doanh thu cho tháng
        }

        // Tính doanh thu từ hóa đơn
        for (Invoice invoice : invoices) {
            LocalDate invoiceDate = invoice.getCreatedAt().toLocalDate(); // Giả sử có trường createdAt
            String monthKey = invoiceDate.getMonth().name() + " " + invoiceDate.getYear();

            // Cộng dồn doanh thu vào tháng tương ứng
            if (revenueData.containsKey(monthKey)) {
                revenueData.put(monthKey, revenueData.get(monthKey) + invoice.getAmount()); // Giả sử có trường amount
            }
        }

        // Tạo danh sách tháng theo thứ tự tăng dần
        List<String> orderedMonths = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            LocalDate month = now.minusMonths(5 - i); // Sắp xếp từ tháng hiện tại đến tháng trước
            String monthKey = month.getMonth().name() + " " + month.getYear();
            orderedMonths.add(monthKey);
        }

        // Tạo bản đồ doanh thu theo thứ tự tháng đã sắp xếp
        Map<String, Double> orderedRevenueData = new LinkedHashMap<>();
        for (String monthKey : orderedMonths) {
            orderedRevenueData.put(monthKey, revenueData.getOrDefault(monthKey, 0.0));
        }

        return orderedRevenueData; // Trả về dữ liệu doanh thu theo thứ tự tháng
    }
}
