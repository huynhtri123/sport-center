package app.sportcenter.configs;

import app.sportcenter.commons.FieldStatus;
import app.sportcenter.models.entities.Booking;
import app.sportcenter.models.entities.Field;
import app.sportcenter.models.entities.TimeSlot;
import app.sportcenter.repositories.BookingRepository;
import app.sportcenter.repositories.FieldRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
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
    @Scheduled(fixedRate = 60000) // chạy mỗi 1 phut
    public void checkFieldTimeSlotsStatus() {
        ZonedDateTime now = ZonedDateTime.now();
        log.info("Check booking status. Thời gian hiện tại (+7): " + now);

        // lấy tất cả các booking đã hết hạn (thời gian kết thúc trước hiện tại)
        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(now);

        List<Field> fieldsToSave = new ArrayList<>();
        List<Booking> bookingsToSave = new ArrayList<>();

        for (Booking booking : expiredBookings) {
            Field field = booking.getField();
            // 2 cái sau đây là giờ +7, nên chuyển nó về +0 để tạo timeSlot:
            ZonedDateTime bookingStartTime = booking.getStartTime().withZoneSameInstant(ZoneOffset.UTC);
            ZonedDateTime bookingEndTime = booking.getEndTime().withZoneSameInstant(ZoneOffset.UTC);

            // tạo timeSlot mới <=> trả nó về AVAILABLE
            field.createTimeSlots(bookingStartTime, bookingEndTime);
            fieldsToSave.add(field);
            booking.setIsActive(false);
            bookingsToSave.add(booking);
            log.info("Đặt sân hết hạn, vừa cập nhật về AVAILABLE (bookingId: {})", booking.getId());
        }
        fieldRepository.saveAll(fieldsToSave);
        bookingRepository.saveAll(bookingsToSave);
    }

}
