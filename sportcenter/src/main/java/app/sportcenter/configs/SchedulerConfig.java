package app.sportcenter.configs;

import app.sportcenter.commons.FieldStatus;
import app.sportcenter.models.entities.Booking;
import app.sportcenter.models.entities.Field;
import app.sportcenter.repositories.BookingRepository;
import app.sportcenter.repositories.FieldRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

@Configuration
@Slf4j
@EnableScheduling
public class SchedulerConfig {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private FieldRepository fieldRepository;

    @Bean
    public ScheduledExecutorService scheduledExecutorService() {
        return Executors.newScheduledThreadPool(5);
    }

    @Transactional
    @Scheduled(fixedRate = 60000)       // chạy mỗi 1 phut
    public void checkFieldStatus() {
        ZonedDateTime now = ZonedDateTime.now();
        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(now, FieldStatus.IN_USE.name());
        for (Booking booking : expiredBookings) {
            Field field = booking.getField();
            if (field.getFieldStatus().equals(FieldStatus.IN_USE)) {
                field.setFieldStatus(FieldStatus.AVAILABLE);        // đổi trạng thái sân về trống
                fieldRepository.save(field);
                booking.setField(field);                            // cập nhật booking với sân mới
                bookingRepository.save(booking);
                log.info("Đặt sân hết hạn. Đã đổi trạng thái sân về AVAILABLE, ID sân: {}, ID booking: {}",
                        field.getId(), booking.getId());
            }
        }
    }
}
