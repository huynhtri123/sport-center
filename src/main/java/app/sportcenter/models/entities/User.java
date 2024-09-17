package app.sportcenter.models.entities;

import app.sportcenter.commons.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;
import java.util.List;

@Document(collection = "User")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class User extends BaseEntity {
    @Id
    private String id;
    private String fullName;
    private String email;
    private String password;
    private String phoneNumber;
    private String address;
    private ZonedDateTime dateOfBirth;
    private String avatarUrl;               // link ảnh đại diện
    private Role role;
    private List<LineItem> cart;            // giỏ hàng
    @DBRef(lazy = true)
    private List<PaymentInfo> paymentInfos; // danh sách thông tin thanh toán
}
