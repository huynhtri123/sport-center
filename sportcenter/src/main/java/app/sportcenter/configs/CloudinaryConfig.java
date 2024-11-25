package app.sportcenter.configs;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {
    @Autowired
    private AppConfig appConfig;
    @Bean
    public Cloudinary cloudinary(){
        final Map<String, String> config = new HashMap<>();
        config.put("cloud_name", appConfig.getCloudName());
        config.put("api_key", appConfig.getCloudApiKey());
        config.put("api_secret", appConfig.getCloudApiSecret());
        return new Cloudinary(config);
    }
}
