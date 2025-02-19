package app.sportcenter.models.dto.request;

import app.sportcenter.commons.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class VNPayRequest extends BaseRequestDTO {
    @NotBlank(message = "Bạn chưa nhập userId cho yêu cầu thanh toán")
    private String userId;

    @NotNull(message = "Bạn chưa nhập số tiền thanh toán")
    @Min(value = 0, message = "Số tiền thanh toán phải là số không âm")
    private Double amount;

    // nếu thanh toán lộn xộn
    @Min(value = 0, message = "Số tiền thanh toán bằng số dư phải là số không âm")
    private Double amountByBalance = 0.0;

    @NotNull(message = "Bạn chưa nhập loại giao dịch")
    private TransactionType transactionType;

    private String bookingId;

    private String registerOrderId;

}