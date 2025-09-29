package app.sportcenter.services.impl;

import app.sportcenter.commons.PaymentStatus;
import app.sportcenter.commons.Role;
import app.sportcenter.commons.TransactionType;
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

//@Override
//public Map<String, Map<String, Double>> getRevenueLastTwelveMonths() {
//    List<Invoice> invoices = invoiceRepository.findByIsActiveTrueAndIsDeletedFalse();
//    Map<String, Double> revenueData = new LinkedHashMap<>();
//    Map<String, Double> refundFeeData = new LinkedHashMap<>();
//    LocalDate now = LocalDate.now();
//
//    // Khởi tạo doanh thu và phí refund cho từng tháng (12 tháng gần nhất)
//    for (int i = 0; i < 12; i++) {
//        LocalDate month = now.minusMonths(i);
//        String monthKey = month.getMonth().name() + " " + month.getYear();
//        revenueData.put(monthKey, 0.0);
//        refundFeeData.put(monthKey, 0.0);
//    }
//
//    // Tính toán doanh thu từ hóa đơn
//    for (Invoice invoice : invoices) {
//        LocalDate invoiceDate = invoice.getCreatedAt().toLocalDate(); // Giả sử có trường createdAt
//        String monthKey = invoiceDate.getMonth().name() + " " + invoiceDate.getYear();
//
//        // Chỉ xử lý nếu hóa đơn thuộc 12 tháng gần nhất
//        if (revenueData.containsKey(monthKey)) {
//            double currentRevenue = revenueData.get(monthKey);
//            double currentRefundFee = refundFeeData.get(monthKey);
//
//            if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
//                if (invoice.getTransactionType() == TransactionType.BOOKING ||
//                        invoice.getTransactionType() == TransactionType.REGISTRATION_FEE) {
//                    // Cộng doanh thu hợp lệ
//                    currentRevenue += invoice.getAmount();
//                } else if (invoice.getTransactionType() == TransactionType.REFUND) {
//                    // Trừ đi số tiền hoàn trả
//                    currentRevenue -= invoice.getAmount();
//                    // Ghi nhận tổng phí refund cho tháng đó
//                    currentRefundFee += invoice.getAmount();
//                }
//            }
//
//            // Cập nhật dữ liệu vào Map
//            revenueData.put(monthKey, currentRevenue);
//            refundFeeData.put(monthKey, currentRefundFee);
//        }
//    }
//
//    // Sắp xếp lại theo thứ tự từ tháng cũ nhất đến mới nhất
//    List<String> orderedMonths = new ArrayList<>();
//    for (int i = 0; i < 12; i++) {
//        LocalDate month = now.minusMonths(11 - i);
//        String monthKey = month.getMonth().name() + " " + month.getYear();
//        orderedMonths.add(monthKey);
//    }
//
//    // Định dạng lại dữ liệu theo thứ tự đã sắp xếp
//    Map<String, Map<String, Double>> finalData = new LinkedHashMap<>();
//    for (String monthKey : orderedMonths) {
//        Map<String, Double> monthData = new HashMap<>();
//        monthData.put("revenue", revenueData.getOrDefault(monthKey, 0.0));
//        monthData.put("refund_fee", refundFeeData.getOrDefault(monthKey, 0.0));
//        finalData.put(monthKey, monthData);
//    }
//
//    return finalData; // Trả về doanh thu và phí hoàn trả theo từng tháng của cả năm
//}
@Override
public Map<String, Map<String, Double>> getRevenueForYear(int year) {
    List<Invoice> invoices = invoiceRepository.findByIsActiveTrueAndIsDeletedFalse();
    Map<String, Double> revenueData = new LinkedHashMap<>();
    Map<String, Double> refundFeeData = new LinkedHashMap<>();

    // Khởi tạo doanh thu và phí refund cho từng tháng trong năm
    for (int i = 1; i <= 12; i++) {
        String monthKey = getMonthName(i) + " " + year;
        revenueData.put(monthKey, 0.0);
        refundFeeData.put(monthKey, 0.0);
    }

    // Lọc hóa đơn theo năm
    for (Invoice invoice : invoices) {
        LocalDate invoiceDate = invoice.getCreatedAt().toLocalDate();

        if (invoiceDate.getYear() == year) {
            String monthKey = getMonthName(invoiceDate.getMonthValue()) + " " + year;

            double currentRevenue = revenueData.getOrDefault(monthKey, 0.0);
            double currentRefundFee = refundFeeData.getOrDefault(monthKey, 0.0);

            if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
                if (invoice.getTransactionType() == TransactionType.BOOKING ||
                        invoice.getTransactionType() == TransactionType.REGISTRATION_FEE) {
                    currentRevenue += invoice.getAmount();
                } else if (invoice.getTransactionType() == TransactionType.REFUND) {
                    //currentRevenue -= invoice.getAmount();
                    currentRefundFee += invoice.getAmount();
                }
            }

            // Cập nhật dữ liệu vào Map
            revenueData.put(monthKey, currentRevenue);
            refundFeeData.put(monthKey, currentRefundFee);
        }
    }

    // Tạo Map kết quả theo đúng thứ tự từ tháng 1 đến tháng 12
    Map<String, Map<String, Double>> finalData = new LinkedHashMap<>();
    for (int i = 1; i <= 12; i++) {
        String monthKey = getMonthName(i) + " " + year;
        Map<String, Double> monthData = new HashMap<>();
        monthData.put("revenue", revenueData.getOrDefault(monthKey, 0.0));
        monthData.put("refund_fee", refundFeeData.getOrDefault(monthKey, 0.0));
        finalData.put(monthKey, monthData);
    }

    return finalData; // Trả về doanh thu và phí hoàn trả cho 12 tháng của năm được chỉ định
}

    // Phương thức chuyển đổi số tháng thành tên tháng đầy đủ
    private String getMonthName(int month) {
        return switch (month) {
            case 1 -> "January";
            case 2 -> "February";
            case 3 -> "March";
            case 4 -> "April";
            case 5 -> "May";
            case 6 -> "June";
            case 7 -> "July";
            case 8 -> "August";
            case 9 -> "September";
            case 10 -> "October";
            case 11 -> "November";
            case 12 -> "December";
            default -> throw new IllegalArgumentException("Invalid month: " + month);
        };
    }

}
