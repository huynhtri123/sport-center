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
    private final FieldRepository fieldRepository;
    private final RegisterOrderRepository registerOrderRepository;
    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final RecurringBookingRepository recurringBookingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Bean
    public ScheduledExecutorService scheduledExecutorService() {
        return Executors.newScheduledThreadPool(5);
    }

    // check BOOKING status -> reset field status
    @Transactional
    @Scheduled(fixedRate = 60000) // chạy moi 1p
    public void checkFieldTimeSlotsStatus() {
        ZonedDateTime now = ZonedDateTime.now();
        log.info("Check booking expire. Thời gian hiện tại (+7): {}", now);

        // get all expired bookings (endTime<now || isProcessing=true > 5p)
        ZonedDateTime minutesAgo = ZonedDateTime.now().minusMinutes(5);
        List<Booking> expiredBookings = bookingRepository.findExpiredOrStaleProcessingBookings(now, minutesAgo);

        if (expiredBookings.isEmpty()) {
            return; // Không có thay đổi, thoát luôn
        }
        log.info("Check expired bookings: {}", expiredBookings.size());

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
            booking.setProcessing(false);
            booking.setIsDeleted(true);
            bookingsToSave.add(booking);
            log.info("Đặt sân hết hạn, vừa cập nhật về AVAILABLE (bookingId: {})", booking.getId());
        }
        fieldRepository.saveAll(fieldsToSave);
        bookingRepository.saveAll(bookingsToSave);

        messagingTemplate.convertAndSend("/topic/booking-updates", Map.of("message", "Update field status!"));
    }

    // check RECURRING status
    // isProcessing > 5p -> off
    @Transactional
    @Scheduled(fixedRate = 60000) // chạy moi 1p
    public void checkExpiredRecurrings() {
        // get all recurrings: isProcessing > 5p
        ZonedDateTime minutesAgo = ZonedDateTime.now().minusMinutes(5);
        List<RecurringBooking> expiredProcessings = recurringBookingRepository.findByIsProcessingTrueAndCreatedAtBefore(minutesAgo);
        log.info("Check recurring: {}" , expiredProcessings.size());

        List<RecurringBooking> savedList = new ArrayList<>();
        for (RecurringBooking recurringBooking : expiredProcessings) {
            recurringBooking.setProcessing(false);
            recurringBooking.setIsActive(false);
            recurringBooking.setIsDeleted(true);
            savedList.add(recurringBooking);
            log.warn("Recurring processing overtime -> off!");
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
