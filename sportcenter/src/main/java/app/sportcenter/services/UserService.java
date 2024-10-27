package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.UserRequest;
import app.sportcenter.models.entities.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService {
    public UserDetailsService userDetailsService();
    public User getUserByEmail(String email);
    public ResponseEntity<BaseResponse> updateInfoCurrentUser(UserRequest userRequest);
    public ResponseEntity<BaseResponse> getCurrentProfile();
}
