package app.sportcenter.services.impl;

import app.sportcenter.commons.Role;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.InvoiceRequest;
import app.sportcenter.models.dto.InvoiceResponse;
import app.sportcenter.models.entities.Invoice;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.InvoiceRepository;
import app.sportcenter.services.InvoiceService;
import app.sportcenter.utils.mappers.InvoiceMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class InvoiceServiceImpl implements InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;
    @Autowired
    private InvoiceMapper invoiceMapper;

    @Override
    public InvoiceResponse create(InvoiceRequest invoiceRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) authentication.getPrincipal();
        if (invoiceRequest.getUserId().equals(currUser.getId()) || currUser.getRole().equals(Role.ADMIN)) {
            Invoice invoice = invoiceMapper.convertToEntity(invoiceRequest);
            Invoice savedInvoice = invoiceRepository.save(invoice);
            InvoiceResponse response = invoiceMapper.convertToResponse(savedInvoice);
            return response;
        }
        return null;
    }

    @Override
    public List<InvoiceResponse> getAllActive() {
        List<InvoiceResponse> responses = invoiceRepository.findByIsActiveTrueAndIsDeletedFalse()
                .stream().map(invoiceMapper::convertToResponse)
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
                .orElseThrow(() -> new NotFoundException("Không tìm thấy invoice"));
        // admin hoặc chủ nhân moi duoc
        if (currUser.getRole().equals(Role.ADMIN) || currUser.getId().equals(invoice.getUser().getId())) {
            invoice.setIsDeleted(flag);
            Invoice updatedInvoice = invoiceRepository.save(invoice);
            InvoiceResponse response = invoiceMapper.convertToResponse(updatedInvoice);
            return response;
        } else {
            throw new CustomException("Bạn không có quyền thực hiện hành động này lên hoá đơn này", HttpStatus.BAD_REQUEST.value());
        }
    }

    @Override
    public InvoiceResponse forceDelete(String invoiceId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) authentication.getPrincipal();
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy invoice"));
        // admin hoặc chủ nhân moi duoc
        if (currUser.getRole().equals(Role.ADMIN) || currUser.getId().equals(invoice.getUser().getId())) {
            invoiceRepository.deleteById(invoiceId);
            InvoiceResponse response = invoiceMapper.convertToResponse(invoice);
            return response;
        } else {
            throw new CustomException("Bạn không có quyền thực hiện hành động này lên hoá đơn này", HttpStatus.BAD_REQUEST.value());
        }
    }
}
