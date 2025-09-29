package app.sportcenter.services.impl;

import app.sportcenter.configs.AppConfig;
import app.sportcenter.services.JWTService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class JWTServiceImpl implements JWTService {
    private final AppConfig appConfig;

    @Override
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000L *60 * 30)) // hết hạn sau 30 phút: 1000L *60 * 30
                .signWith(getSigninKey(), Jwts.SIG.HS256)
                .compact();
    }

    @Override
    public String generateRefreshToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7)) // hết hạn sau 7 ngày: 1000L * 60 * 60 * 24 * 7
                .signWith(getSigninKey(), Jwts.SIG.HS256)
                .compact();
    }

    @Override
    public SecretKey getSigninKey() {
        byte[] key = Decoders.BASE64URL.decode(appConfig.getJwtSecretKey());
        return Keys.hmacShaKeyFor(key);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigninKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            // Trả về Claims ngay cả khi token hết hạn
            return e.getClaims();
        } catch (Exception e) {
            // Các lỗi khác
            throw new IllegalArgumentException("Invalid token", e);
        }
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolvers) {
        final Claims claims = extractAllClaims(token);
        return claimsResolvers.apply(claims);
    }

    public String extractUserName(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    @Override
    public boolean isExpiredToken(String token) {
        try {
            Date expiration = extractClaim(token, Claims::getExpiration);
            return expiration.before(new Date());
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            return true; // token đã hết hạn
        }
    }

    @Override
    public boolean isValidToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUserName(token);
            return (username.equals(userDetails.getUsername()) && !isExpiredToken(token));
        } catch (Exception e) {
            return false; // Token không hợp lệ
        }
    }

    @Override
    public Date extractIssuedAt(String token) {
        return extractClaim(token, Claims::getIssuedAt);
    }

}
