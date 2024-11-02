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

    @Value("5")     // 5 phút
    private Integer verifyExpireTime;
    @Value("10")
    private Integer logRounds;

    @Value(("http://localhost:3001"))
    private String clientUrl;

    @Value(("https://png.pngtree.com/png-vector/20190226/ourlarge/pngtree-question-mark-vector-icon-png-image_706042.jpg"))
    private String defaultIcon;
}
