package app.sportcenter.configs;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary(){
        final Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dftznqjsj");
        config.put("api_key", "234483753535781");
        config.put("api_secret", "QRMjN_rG7EPkPTJnu62TZSwb39Y");
        return new Cloudinary(config);
    }
}
