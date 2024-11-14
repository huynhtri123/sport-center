package app.sportcenter.models.dto;

import app.sportcenter.commons.Role;
import app.sportcenter.models.entities.LineItem;
import app.sportcenter.models.entities.PaymentInfo;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class UserResponse extends BaseResponseDTO {
    private String id;
    private String fullName;
    private String email;
    private String password;
    private String phoneNumber;
    private String address;
    private ZonedDateTime dateOfBirth;
    private String avatarUrl;
    private Role role;
    private List<LineItem> cart;
    private List<PaymentInfo> paymentInfos;
}
