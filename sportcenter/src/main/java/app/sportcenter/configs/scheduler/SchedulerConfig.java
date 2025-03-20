package app.sportcenter.configs.scheduler;

import app.sportcenter.commons.OrderStatus;
import app.sportcenter.models.entities.*;
import app.sportcenter.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.stream.Collectors;

@Configuration
@Slf4j
@EnableScheduling
@RequiredArgsConstructor
public class SchedulerConfig {
    private final BookingRepository bookingRepository;
    private final RegisterOrderRepository registerOrderRepository;
    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final RecurringBookingRepository recurringBookingRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final FieldStatusByDateRepository fieldStatusByDateRepository;

    @Bean
    public ScheduledExecutorService scheduledExecutorService() {
        return Executors.newScheduledThreadPool(5);
    }

    // check BOOKING status -> reset field status
    @Transactional
    @Scheduled(fixedRate = 60000) // Chạy mỗi 1 phút
    public void checkFieldTimeSlotsStatus() {
        ZonedDateTime now = ZonedDateTime.now();
        log.info("Check booking expire. Thời gian hiện tại (+7): {}", now);

        // Lấy danh sách các booking hết hạn (endTime < now) hoặc đang xử lý quá 5 phút
        ZonedDateTime minutesAgo = ZonedDateTime.now().minusMinutes(5);
        List<Booking> expiredBookings = bookingRepository.findExpiredOrStaleProcessingBookings(now, minutesAgo);

        if (expiredBookings.isEmpty()) {
            return;
        }
        log.info("Check expired bookings: {}", expiredBookings.size());

        List<FieldStatusByDate> fieldStatusToUpdate = new ArrayList<>();
        List<Booking> bookingsToSave = new ArrayList<>();

        for (Booking booking : expiredBookings) {
            ZonedDateTime startTime = booking.getStartTime().withZoneSameInstant(ZoneOffset.UTC);
            ZonedDateTime endTime = booking.getEndTime().withZoneSameInstant(ZoneOffset.UTC);
            ZonedDateTime startOfDayUTC = startTime.toLocalDate().atStartOfDay(ZoneOffset.UTC);

            // Lấy trạng thái sân theo ngày
            FieldStatusByDate fieldStatusByDate = fieldStatusByDateRepository
                    .findByFieldIdAndDate(booking.getField().getId(), startOfDayUTC)
                    .orElse(null);

            if (fieldStatusByDate != null) {
                // Xóa TimeSlot của booking hết hạn khỏi danh sách
                fieldStatusByDate.getTimeSlots().removeIf(ts ->
                        (ts.getStartTime().isEqual(startTime) || ts.getStartTime().isAfter(startTime))
                                && (ts.getEndTime().isEqual(endTime) || ts.getEndTime().isBefore(endTime))
                );
                fieldStatusToUpdate.add(fieldStatusByDate);
            }

            // Cập nhật trạng thái booking
            booking.setIsActive(false);
            booking.setProcessing(false);

            // Nếu đang xử lý quá 5 phút -> xóa luôn (không tính vào thống kê)
            booking.setIsDeleted(!booking.getEndTime().isBefore(now));
            bookingsToSave.add(booking);

            log.info("Đặt sân hết hạn, vừa cập nhật về AVAILABLE (bookingId: {})", booking.getId());
        }

        fieldStatusByDateRepository.saveAll(fieldStatusToUpdate);
        bookingRepository.saveAll(bookingsToSave);

        // ws
        messagingTemplate.convertAndSend("/topic/booking-updates", Map.of("message", "Update field status!"));
    }

    // check RECURRING status
    // isProcessing > 5p -> off
    @Transactional
    @Scheduled(fixedRate = 60000) // Chạy mỗi 1 phút
    public void checkExpiredRecurrings() {
        ZonedDateTime minutesAgo = ZonedDateTime.now().minusMinutes(5);
        List<RecurringBooking> expiredProcessings = recurringBookingRepository.findByIsProcessingTrueAndCreatedAtBefore(minutesAgo);

        if (expiredProcessings.isEmpty()) {
            return;
        }

        log.info("Số recurring booking quá hạn xử lý: {}", expiredProcessings.size());

        List<RecurringBooking> savedList = new ArrayList<>();
        for (RecurringBooking recurringBooking : expiredProcessings) {
            recurringBooking.setProcessing(false);
            recurringBooking.setIsActive(false);
            recurringBooking.setIsDeleted(true);
            savedList.add(recurringBooking);

            log.warn("Recurring booking quá hạn xử lý -> Đã hủy! (recurringId: {})", recurringBooking.getId());
        }

        recurringBookingRepository.saveAll(savedList);
    }

    // check REGISTER TOURNAMENT ORDER (inactive 'PENDING + overtime' Order)
    @Transactional
    @Scheduled(fixedRate = 60000)   // chay moi 1 phut
    public void checkExpiredOrders() {
        // get all expired orders: PENDING > 5p
        ZonedDateTime minutesAgo = ZonedDateTime.now().minusMinutes(5);
        List<RegisterOrder> expiredOrders = registerOrderRepository.findByOrderStatusAndCreatedAtBefore(
                OrderStatus.PENDING, minutesAgo
        );
        log.info("Check expired register order: {}" , expiredOrders.size());

        if (expiredOrders.isEmpty()) return;

        List<String> teamIds = expiredOrders.stream().map(RegisterOrder::getTeamId).toList();
        List<String> tournamentIds = expiredOrders.stream().map(RegisterOrder::getTournamentId).distinct().toList();

        teamRepository.deleteAllById(teamIds);

        Map<String, Tournament> tournamentMap = tournamentRepository.findAllById(tournamentIds)
                .stream().collect(Collectors.toMap(Tournament::getId, t -> t));

        List<Tournament> saveTournaments = new ArrayList<>();
        List<RegisterOrder> saveOrders = new ArrayList<>();
        for (RegisterOrder order : expiredOrders) {
            Tournament tournament = tournamentMap.get(order.getTournamentId());
            if (tournament != null) {
                tournament.getRegisteredTeamIds().remove(order.getTeamId());
                saveTournaments.add(tournament);
            }
            order.setOrderStatus(OrderStatus.EXPIRED);
            saveOrders.add(order);
        }
        tournamentRepository.saveAll(saveTournaments);
        registerOrderRepository.saveAll(saveOrders);
    }

}
