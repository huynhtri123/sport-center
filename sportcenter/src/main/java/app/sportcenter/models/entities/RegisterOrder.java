package app.sportcenter.models.entities;

import app.sportcenter.commons.OrderStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "register_order")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class RegisterOrder extends BaseEntity {
    @Id
    private String id;
    private String ownerId;
    private String teamId;
    private String tournamentId;
    private OrderStatus orderStatus;
}
