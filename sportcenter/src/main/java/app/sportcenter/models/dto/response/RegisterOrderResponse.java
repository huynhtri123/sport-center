package app.sportcenter.models.dto.response;

import app.sportcenter.commons.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class RegisterOrderResponse extends BaseResponseDTO {
    private String ownerId;
    private String teamId;
    private String tournamentId;
    private OrderStatus orderStatus;
}
