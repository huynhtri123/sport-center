package app.sportcenter.models.dto;

import app.sportcenter.commons.Role;
import app.sportcenter.models.entities.LineItem;
import app.sportcenter.models.entities.PaymentInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
