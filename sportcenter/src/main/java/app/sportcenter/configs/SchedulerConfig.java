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
    @Scheduled(fixedRate = 60000) // chạy mỗi 1 phut
    public void checkFieldTimeSlotsStatus() {
        ZonedDateTime now = ZonedDateTime.now().plusHours(7);   // vì khi tạo bookign thì ta đã trừ 7

        // 1. Lấy tất cả các booking đã hết hạn (thời gian kết thúc trước hiện tại)
        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(now);

        for (Booking booking : expiredBookings) {
            Field field = booking.getField();
            ZonedDateTime bookingStartTime = booking.getStartTime();
            ZonedDateTime bookingEndTime = booking.getEndTime();

            if (field.getTimeSlots() == null || field.getTimeSlots().isEmpty()) {
                continue;
            }

            boolean isUpdated = false;

            // 2. Cập nhật các TimeSlot của Field tương ứng với booking đã hết hạn
            for (TimeSlot slot : field.getTimeSlots()) {
                // Chỉ cập nhật trạng thái nếu `TimeSlot` nằm trong thời gian của `Booking` đã hết hạn và hiện đang `IN_USE`
                if (slot.getStatus() == FieldStatus.IN_USE &&
                        slot.getEndTime().isBefore(now) &&
                        slot.getStartTime().isBefore(bookingEndTime) &&
                        slot.getEndTime().isAfter(bookingStartTime)) {

                    slot.setStatus(FieldStatus.AVAILABLE);
                    isUpdated = true; // Đánh dấu là có cập nhật
                }
            }

            // 3. Chỉ lưu nếu có thay đổi trạng thái của `TimeSlot`
            if (isUpdated) {
                booking.setField(field);
                booking.setIsActive(false); // Đánh dấu Booking là không còn hoạt động
                fieldRepository.save(field);
                bookingRepository.save(booking);
                log.info("Đặt sân hết hạn. Đã cập nhật trạng thái TimeSlots về AVAILABLE, ID sân: {}, ID booking: {}",
                        field.getId(), booking.getId());
            }
        }
    }

}
