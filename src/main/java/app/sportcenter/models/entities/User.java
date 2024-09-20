package app.sportcenter.models.entities;

import app.sportcenter.commons.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.List;

@Document(collection = "User")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class User extends BaseEntity implements UserDetails {
    @Id
    private String id;
    private String fullName;
    private String email;
    private String password;
    private String phoneNumber;
    private String address;
    private ZonedDateTime dateOfBirth;
    private String avatarUrl;                   // link ảnh đại diện
    private Role role;
    private List<LineItem> cart;                // giỏ hàng
    @DBRef(lazy = true)
    private List<PaymentInfo> paymentInfos;     // danh sách thông tin thanh toán
    private Verify verify;                      // gửi qua mail khi đăng ký tài khoản
    private Boolean isEmailVerified = false;            // trạng thái tài khoản đã được xác thực chưa

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));    // danh sách role bất biến
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}
