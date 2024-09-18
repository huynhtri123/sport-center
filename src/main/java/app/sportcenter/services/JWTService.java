package app.sportcenter.services;

import org.springframework.security.core.userdetails.UserDetails;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Map;

public interface JWTService {
    public String generateToken(UserDetails userDetails);
    public String generateRefreshToken(Map<String, Object> extraClaims, UserDetails userDetails);
    public SecretKey getSigninKey();
    public String extractUserName(String token);
    public boolean isValidToken(String token, UserDetails userDetails);
}
