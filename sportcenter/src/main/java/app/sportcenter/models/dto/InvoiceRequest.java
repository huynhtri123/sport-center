package app.sportcenter.models.dto;

import app.sportcenter.commons.PaymentMethod;
import app.sportcenter.commons.PaymentStatus;
import app.sportcenter.commons.PricedItem;
import app.sportcenter.commons.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class InvoiceRequest extends BaseRequestDTO {
    @NotBlank(message = "Bạn chưa nhập userId cho hoá đơn")
    private String userId;

    @NotNull(message = "Bạn chưa nhập giá tiền của hoá đơn")
    @Positive(message = "Giá tiền của hoá đơn phải là số dương")
    private Double totalAmount;

    @NotNull(message = "Bạn chưa nhập trạng thái thanh toán")
    private PaymentStatus paymentStatus;

    @NotNull(message = "Bạn chưa nhập phương thức thanh toán")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Bạn chưa nhập loại giao dịch")
    private TransactionType transactionType;

//    private List<Object> items;
}
