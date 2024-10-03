package app.sportcenter.services.impl;

import app.sportcenter.configs.AppConfig;
import app.sportcenter.services.JWTService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTServiceImpl implements JWTService {
    @Autowired
    private AppConfig appConfig;

    @Override
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 30)) // hết hạn sau 30 phút
                .signWith(getSigninKey(), Jwts.SIG.HS256)
                .compact();
    }

    @Override
    public String generateRefreshToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7)) // hết hạn sau 7 ngày
                .signWith(getSigninKey(), Jwts.SIG.HS256)
                .compact();
    }

    @Override
    public SecretKey getSigninKey() {
        byte[] key = Decoders.BASE64URL.decode(appConfig.getJwtSecretKey());
        return Keys.hmacShaKeyFor(key);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigninKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolvers) {
        final Claims claims = extractAllClaims(token);
        return claimsResolvers.apply(claims);
    }

    public String extractUserName(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private boolean isExpiredToken(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    @Override
    public boolean isValidToken(String token, UserDetails userDetails) {
        final String username = extractUserName(token);
        return (username.equals(userDetails.getUsername()) && !isExpiredToken(token));
    }

}
