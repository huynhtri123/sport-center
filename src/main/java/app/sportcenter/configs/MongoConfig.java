package app.sportcenter.configs;

import app.sportcenter.utils.converter.ZoneDateTimeReadConverter;
import app.sportcenter.utils.converter.ZoneDateTimeWriteConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;


import java.util.Arrays;

@Configuration
@EnableMongoAuditing
public class MongoConfig {
    @Bean
    public MongoCustomConversions customConversions() {
        return new MongoCustomConversions(Arrays.asList(
                new ZoneDateTimeReadConverter(),
                new ZoneDateTimeWriteConverter()
        ));
    }
}
