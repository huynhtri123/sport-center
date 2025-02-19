package app.sportcenter.utils.mappers;

import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.request.InvoiceRequest;
import app.sportcenter.models.dto.response.InvoiceResponse;
import app.sportcenter.models.entities.Invoice;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class InvoiceMapper {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private UserRepository userRepository;

    public Invoice convertToEntity(InvoiceRequest invoiceRequest) {
        Invoice invoice = modelMapper.map(invoiceRequest, Invoice.class);
        User user = userRepository.findById(invoiceRequest.getUserId()).orElseThrow(
                () -> new NotFoundException("Không tìm thấy người dùng để convert hoá đơn")
        );
        invoice.setUser(user);

        return invoice;
    }

    public InvoiceResponse convertToResponse(Invoice invoice) {
        InvoiceResponse response = modelMapper.map(invoice, InvoiceResponse.class);
        response.setUserEmail(invoice.getUser().getEmail());
        response.setUserFullName(invoice.getUser().getFullName());

        return response;
    }

    public InvoiceResponse convertToDTO(Invoice invoice) {
        return (invoice != null) ? modelMapper.map(invoice, InvoiceResponse.class) : null;
    }

}
