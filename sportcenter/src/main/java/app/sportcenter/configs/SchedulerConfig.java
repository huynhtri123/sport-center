package app.sportcenter.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

@Configuration
@EnableScheduling // các chỗ dùng @Scheduled mới cần dùng
public class SchedulerConfig {
    @Bean
    public ScheduledExecutorService scheduledExecutorService() {
        // tạo một ScheduledExecutorService với 5 thread
        return Executors.newScheduledThreadPool(5);
    }

}
