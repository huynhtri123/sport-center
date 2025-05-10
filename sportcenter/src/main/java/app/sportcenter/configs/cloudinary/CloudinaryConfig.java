package app.sportcenter.configs.cloudinary;

import app.sportcenter.configs.AppConfig;
import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class CloudinaryConfig {

    private final AppConfig appConfig;

    @Bean
    public Cloudinary cloudinary(){
        final Map<String, String> config = new HashMap<>();
        config.put("cloud_name", appConfig.getCloudName());
        config.put("api_key", appConfig.getCloudApiKey());
        config.put("api_secret", appConfig.getCloudApiSecret());
        return new Cloudinary(config);
    }
}
