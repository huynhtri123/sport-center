package app.sportcenter.models.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    @NotBlank(message = "Bạn chưa nhập tên ngân hàng!")
    private String bankName;

    @NotBlank(message = "Bạn chưa nhập số thẻ thanh toán!")
    private String cardNumber;

    @NotBlank(message = "Bạn chưa nhập tên chủ thẻ!")
    private String cardHolderName;

    private ZonedDateTime issueDate;

    @NotBlank(message = "Bạn chưa id chủ thẻ!")
    private String userId;
}
