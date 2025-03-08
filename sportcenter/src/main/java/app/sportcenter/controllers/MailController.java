package app.sportcenter.controllers;

import app.sportcenter.models.entities.TimeSlot;
import app.sportcenter.utils.kafkaUsage.MessageWrapper;
import app.sportcenter.commons.SendMailType;
import app.sportcenter.utils.kafkaUsage.TournamentTeamPayload;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.response.BookingResponse;
import app.sportcenter.models.dto.response.RecurringBookingResponse;
import app.sportcenter.models.dto.response.TeamResponse;
import app.sportcenter.models.dto.response.TournamentResponse;
import app.sportcenter.services.MailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;

    private final ObjectMapper objectMapper; // Jackson ObjectMapper để deserialize JSON

    @KafkaListener(topics = "notification-delivery")
    public void listenNotificationDelivery(MessageWrapper p) {
        try {
            SendMailType sendMailType = SendMailType.valueOf(p.getType());
            switch (sendMailType) {
                case CONFIRM_BOOKING:
                    BookingResponse bookingResponse = objectMapper.convertValue(p.getPayload(), BookingResponse.class);
                    sendMailBooking(p.getToEmail(), p.getToFullName(), bookingResponse);
                    log.info("Confirm Booking: {}", bookingResponse);
                    break;

                case CONFIRM_RECURRING:
                    RecurringBookingResponse recurringBookingResponse =
                            objectMapper.convertValue(p.getPayload(), RecurringBookingResponse.class);
                    sendMailRecurringBooking(p.getToEmail(), p.getToFullName(), recurringBookingResponse);
                    log.info("OTP Verify: {}", recurringBookingResponse);
                    break;

                case OTP_VERIFY:
                    String verifyCode = objectMapper.convertValue(p.getPayload(), String.class);
                    mailService.sendMailVerify(p.getToEmail(), p.getToFullName(), verifyCode, "VerifyTemplate");
                    log.info("Confirm Recurring: {}", verifyCode);
                    break;

                case CANCEL_RECURRING:
                    RecurringBookingResponse cancelRecurringBookingResponse =
                            objectMapper.convertValue(p.getPayload(), RecurringBookingResponse.class);
                    sendMailRecurringBookingCancel(p.getToEmail(), p.getToFullName(), cancelRecurringBookingResponse);
                    log.info("OTP Verify: {}", cancelRecurringBookingResponse);
                    break;

                case CANCEL_BOOKING:
                    BookingResponse cancelBookingResponse = objectMapper.convertValue(p.getPayload(), BookingResponse.class);
                    sendMailCancelBooking(p.getToEmail(), p.getToFullName(), cancelBookingResponse);
                    log.info("Confirm Booking: {}", cancelBookingResponse);
                    break;

                case REGISTER_TOURNAMENT:
                    TournamentTeamPayload registerTournamentPayload = objectMapper.convertValue(p.getPayload(), TournamentTeamPayload.class);
                    TournamentResponse tournamentResponse = registerTournamentPayload.getTournament();
                    TeamResponse teamResponse = registerTournamentPayload.getTeam();
                    sendRegistrationEmail(p.getToEmail(), tournamentResponse, teamResponse);
                    log.info("Confirm Booking: {}", registerTournamentPayload);
                    break;

                case CANCEL_REGISTER_TOURNAMENT:
                    TournamentTeamPayload unRegisterPayload = objectMapper.convertValue(p.getPayload(), TournamentTeamPayload.class);
                    TournamentResponse unRegisterPayloadTournament = unRegisterPayload.getTournament();
                    TeamResponse unRegisterPayloadTeam = unRegisterPayload.getTeam();
                    sendUnregisterTournament(p.getToEmail(), unRegisterPayloadTournament, unRegisterPayloadTeam);
                    log.info("Confirm Booking: {}", unRegisterPayload);
                    break;

                default:
                    log.warn("Unhandled message type: {}", p.getType());
            }
        } catch (Exception e) {
            log.error("Error processing message: {}", p, e);
        }
    }

    private void sendMailBooking(String email, String fullName, BookingResponse bookingResponse) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss Z");
        try {
            // chuyển sang múi giờ Việt Nam
            ZonedDateTime bookingDateInVietnam = bookingResponse.getBookingDate().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
            ZonedDateTime startTimeInVietnam = bookingResponse.getStartTime().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
            ZonedDateTime endTimeInVietnam = bookingResponse.getEndTime().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));

            String bookingDate = bookingDateInVietnam.format(formatter);
            String numberOfHours = bookingResponse.getNumberOfHours().toString();
            String startTime = startTimeInVietnam.format(formatter);
            String endTime = endTimeInVietnam.format(formatter);
            String totalPrice = bookingResponse.getTotalPrice().toString();

            mailService.sendMailBooking(email, fullName, bookingDate, numberOfHours,
                    startTime, endTime, totalPrice, "BookingTemplate");

        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail booking: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    public void sendMailRecurringBooking(String email, String fullName, RecurringBookingResponse recurringBookingResponse) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        try {
            String fieldName = recurringBookingResponse.getField().getFieldName();

            // chuyển sang múi giờ Việt Nam
            String startDate = recurringBookingResponse.getStartDate()
                    .plusHours(7)
                    .format(formatter);
            String startTime = recurringBookingResponse.getStartTime()
                    .plusHours(7)
                    .format(formatter);

            List<TimeSlot> timeSlots = recurringBookingResponse.getTimeSlots();
            TimeSlot lastTimeSlot = (timeSlots != null && !timeSlots.isEmpty())
                    ? timeSlots.get(timeSlots.size() - 1)
                    : null;

            assert lastTimeSlot != null;
            String endDate = lastTimeSlot.getStartTime()
                    .plusHours(7)
                    .format(formatter);
            String endTime = lastTimeSlot.getEndTime()
                    .plusHours(7)
                    .format(formatter);

            String interval = recurringBookingResponse.getInterval().name(); // DAILY, WEEKLY, MONTHLY
            String numberOfHours = recurringBookingResponse.getNumberOfHours().toString();
            String packageDurationMonths = recurringBookingResponse.getPackageDurationMonths().toString();
            String price = recurringBookingResponse.getTotalPrice().toString();

            mailService.sendMailRecurringBooking(email, fullName, fieldName, startDate, startTime,
                    endDate, endTime, interval, numberOfHours,
                    packageDurationMonths, price, "RecurringBookingTemplate");

        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail đặt sân định kỳ: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    public void sendMailRecurringBookingCancel(String email, String fullName, RecurringBookingResponse recurringBookingResponse) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        try {
            String fieldName = recurringBookingResponse.getField().getFieldName();

            // Chuyển thời gian sang múi giờ Việt Nam (GMT+7)
            String startDate = recurringBookingResponse.getStartDate()
                    .plusHours(7)
                    .format(formatter);
            String startTime = recurringBookingResponse.getStartTime()
                    .plusHours(7)
                    .format(formatter);
            List<TimeSlot> timeSlots = recurringBookingResponse.getTimeSlots();
            TimeSlot lastTimeSlot = (timeSlots != null && !timeSlots.isEmpty())
                    ? timeSlots.get(timeSlots.size() - 1)
                    : null;

            assert lastTimeSlot != null;
            String endDate = lastTimeSlot.getStartTime()
                    .plusHours(7)
                    .format(formatter);
            String endTime = lastTimeSlot.getEndTime()
                    .plusHours(7)
                    .format(formatter);

            String interval = recurringBookingResponse.getInterval().name(); // DAILY, WEEKLY, MONTHLY
            String numberOfHours = recurringBookingResponse.getNumberOfHours().toString();
            Double price = recurringBookingResponse.getTotalPrice();
            Integer durationMonths = recurringBookingResponse.getPackageDurationMonths();
            String duration = durationMonths.toString();
            Double refund = (price * durationMonths * 0.5);

            // Gọi phương thức gửi mail với các thông tin đã được định dạng
            mailService.sendMailRecurringBookingCancel(email, fullName, fieldName, startDate,
                    startTime, endDate, endTime, interval, numberOfHours, price, refund, duration,
                    "RecurringBookingCancelTemplate");

        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail hủy đặt sân định kỳ: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    private void sendMailCancelBooking(String email, String fullName, BookingResponse canceledBooking) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss Z");
        try {
            // Chuyển đổi các thời gian sang múi giờ Việt Nam
            ZonedDateTime bookingDateInVietnam = canceledBooking.getBookingDate().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
            ZonedDateTime startTimeInVietnam = canceledBooking.getStartTime().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
            ZonedDateTime endTimeInVietnam = canceledBooking.getEndTime().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));

            String bookingDate = bookingDateInVietnam.format(formatter);
            String startTime = startTimeInVietnam.format(formatter);
            String endTime = endTimeInVietnam.format(formatter);
            String price = canceledBooking.getTotalPrice().toString();

            // Gọi hàm gửi email
            mailService.sendMailCancelBooking(email, fullName, bookingDate, startTime, endTime, price, "CancelBookingTemplate");

        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail huỷ booking: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    private void sendRegistrationEmail(String toEmail, TournamentResponse tournament, TeamResponse team) {
        ZonedDateTime startDate = tournament.getStartDate().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
        ZonedDateTime endDate = tournament.getEndDate().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
        mailService.sendMailRegisterTournament(
                toEmail,
                tournament.getTournamentName(),
                startDate,
                endDate,
                team,
                "RegisterTournamentTemplate"
        );
    }

    private void sendUnregisterTournament(String toEmail, TournamentResponse tournament, TeamResponse team) {
        ZonedDateTime startDate = tournament.getStartDate().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
        ZonedDateTime endDate = tournament.getEndDate().withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
        mailService.sendMailUnregisterTournament(toEmail, tournament.getTournamentName(),
                startDate, endDate, team, "UnregisterTournamentTemplate");
    }

}