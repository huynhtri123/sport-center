package app.sportcenter.configs;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Data
public class AppConfig {
    @Value("${spring.data.mongodb.uri}")
    private String uri;
    @Value("${spring.data.mongodb.database}")
    private String database;
    @Value("${jwt.secret-key}")
    private String jwtSecretKey;
    @Value("${admin.email}")
    private String adminEmail;
    @Value("${admin.password}")
    private String adminPassword;

    // cloudinary
    @Value("${cloud_name}")
    private String cloudName;
    @Value("${cloud_api_key}")
    private String cloudApiKey;
    @Value("${cloud_api_secret}")
    private String cloudApiSecret;

    @Value("5")     // 5 phút
    private Integer verifyExpireTime;
    @Value("10")
    private Integer logRounds;

    @Value("${client.url}")
    private String clientUrl;

    @Value("${default.icon}")
    private String defaultIcon;
}
