package app.sportcenter.controllers;

import app.sportcenter.models.dto.response.*;
import app.sportcenter.utils.kafkaUsage.MessageWrapper;
import app.sportcenter.utils.kafkaUsage.TournamentTeamPayload;
import app.sportcenter.services.MailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;

    private final ObjectMapper objectMapper; // Jackson ObjectMapper để deserialize JSON

    @KafkaListener(topics = "booking-notification-delivery")
    public void listenBookingNotificationDelivery(MessageWrapper messageWrapper) {
        BookingResponse bookingResponse = objectMapper.convertValue(messageWrapper.getPayload(), BookingResponse.class);
        mailService.sendMailBooking(messageWrapper.getToEmail(), messageWrapper.getToFullName(), bookingResponse);
    }

    @KafkaListener(topics = "cancel-booking-notification-delivery")
    public void listenCancelBookingNotificationDelivery(MessageWrapper messageWrapper) {
        BookingResponse cancelBookingResponse = objectMapper.convertValue(messageWrapper.getPayload(), BookingResponse.class);
        mailService.sendMailCancelBooking(messageWrapper.getToEmail(), messageWrapper.getToFullName(), cancelBookingResponse);
    }

    @KafkaListener(topics = "recurring-notification-delivery")
    public void listenRecurringNotificationDelivery(MessageWrapper messageWrapper) {
        RecurringBookingResponse recurringBookingResponse = objectMapper.convertValue(messageWrapper.getPayload(), RecurringBookingResponse.class);
        mailService.sendMailRecurringBooking(messageWrapper.getToEmail(), messageWrapper.getToFullName(), recurringBookingResponse);
    }

    @KafkaListener(topics = "cancel-recurring-notification-delivery")
    public void listenCancelRecurringNotificationDelivery(MessageWrapper messageWrapper) {
        CancelRecurringInfo cancelRecurringInfo = objectMapper.convertValue(messageWrapper.getPayload(), CancelRecurringInfo.class);
        mailService.sendMailRecurringBookingCancel(messageWrapper.getToEmail(), messageWrapper.getToFullName(), cancelRecurringInfo);
    }

    @KafkaListener(topics = "verify-otp-notification-delivery")
    public void listenVerifyOtpNotificationDelivery(MessageWrapper messageWrapper) {
        String verifyCode = objectMapper.convertValue(messageWrapper.getPayload(), String.class);
        mailService.sendMailVerify(messageWrapper.getToEmail(), messageWrapper.getToFullName(), verifyCode);
    }

    @KafkaListener(topics = "register-tournament-notification-delivery")
    public void listenRegisterTournamentNotificationDelivery(MessageWrapper messageWrapper) {
        TournamentTeamPayload registerTournamentPayload = objectMapper.convertValue(messageWrapper.getPayload(),
                TournamentTeamPayload.class);
        TournamentResponse tournamentResponse = registerTournamentPayload.getTournament();
        TeamResponse teamResponse = registerTournamentPayload.getTeam();
        mailService.sendMailRegisterTournament(messageWrapper.getToEmail(), tournamentResponse, teamResponse);
    }

    @KafkaListener(topics = "unregister-tournament-notification-delivery")
    public void listenUnregisterTournamentNotificationDelivery(MessageWrapper messageWrapper) {
        TournamentTeamPayload unRegisterPayload = objectMapper.convertValue(messageWrapper.getPayload(),
                TournamentTeamPayload.class);
        TournamentResponse unRegisterPayloadTournament = unRegisterPayload.getTournament();
        TeamResponse unRegisterPayloadTeam = unRegisterPayload.getTeam();
        mailService.sendMailUnregisterTournament(messageWrapper.getToEmail(), unRegisterPayloadTournament, unRegisterPayloadTeam);
    }
}