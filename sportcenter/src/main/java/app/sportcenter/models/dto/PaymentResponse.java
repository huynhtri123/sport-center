package app.sportcenter.models.dto;

import lombok.*;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class PaymentResponse {
    private String bankName;
    private String cardNumber;
    private String cardHolderName;
    private ZonedDateTime issueDate;

    private String userId;
}
