package app.sportcenter.models.entities;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;

@Document(collection = "payment_info")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class PaymentInfo extends BaseEntity {
    @Id
    private String id;
    private String bankName;
    private String cardNumber;
    private String cardHolderName;
    private ZonedDateTime issueDate;

    private String userId;
}
