package app.sportcenter.services;

import app.sportcenter.models.entities.User;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService {
    public UserDetailsService userDetailsService();
    public User getUserByEmail(String email);
}
