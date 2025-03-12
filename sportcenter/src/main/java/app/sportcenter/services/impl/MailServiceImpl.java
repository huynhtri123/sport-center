package app.sportcenter.services.impl;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.response.*;
import app.sportcenter.models.entities.TimeSlot;
import app.sportcenter.services.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.text.NumberFormat;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    private void sendEmail(String toEmail, String subject, String templateFile, Context context) {
        try {
            MimeMessagePreparator preparator = mimeMessage -> {
                MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                messageHelper.setTo(toEmail);
                messageHelper.setSubject(subject);
                String content = templateEngine.process(templateFile, context);
                messageHelper.setText(content, true);
            };
            mailSender.send(preparator);
        } catch (Exception e) {
            throw new CustomException("Error sending email: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    private String convertToVietnamTime(ZonedDateTime input) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy");
        ZonedDateTime vietnamTime = input.withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh"));
        return vietnamTime.format(formatter);
    }
    private String convertToVietnamMoney(double input) {
        return NumberFormat.getCurrencyInstance(
                new Locale("vi", "VN")).format(input);
    }

    @Override
    public void sendMailVerify(String toEmail, String userName, String verifyCode) {
        try {
            Context context = new Context();
            context.setVariable("UserName", userName);
            context.setVariable("ToEmail", toEmail);
            context.setVariable("VerifyCode", verifyCode);
            sendEmail(toEmail, "Sport Center - Verification Code", "VerifyTemplate", context);
        } catch (Exception e) {
            throw new CustomException("Error sending email: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public void sendMailBooking(String email, String fullName, BookingResponse bookingResponse) {
        try {
            String bookingDate = convertToVietnamTime(bookingResponse.getBookingDate());
            String startTime = convertToVietnamTime(bookingResponse.getStartTime());
            String endTime = convertToVietnamTime(bookingResponse.getEndTime());
            String numberOfHours = bookingResponse.getNumberOfHours().toString();
            String totalPrice = convertToVietnamMoney(bookingResponse.getTotalPrice());

            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("bookingDate", bookingDate);
            context.setVariable("numberOfHours", numberOfHours);
            context.setVariable("startTime", startTime);
            context.setVariable("endTime", endTime);
            context.setVariable("totalPrice", totalPrice);
            sendEmail(email, "Sport Center - Booking", "BookingTemplate", context);

        } catch (Exception e) {
            throw new CustomException("Error sending booking email: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public void sendMailRecurringBooking(String email, String fullName, RecurringBookingResponse recurringBookingResponse) {
        try {
            String fieldName = recurringBookingResponse.getField().getFieldName();
            String startDate = convertToVietnamTime(recurringBookingResponse.getStartDate());
            String startTime = convertToVietnamTime(recurringBookingResponse.getStartTime());

            List<TimeSlot> timeSlots = recurringBookingResponse.getTimeSlots();
            TimeSlot lastTimeSlot = (timeSlots != null && !timeSlots.isEmpty())
                    ? timeSlots.get(timeSlots.size() - 1)
                    : null;

            assert lastTimeSlot != null;
            String endDate = convertToVietnamTime(lastTimeSlot.getStartTime());
            String endTime = convertToVietnamTime(lastTimeSlot.getEndTime());

            String interval = recurringBookingResponse.getInterval().name(); // DAILY, WEEKLY, MONTHLY
            String numberOfHours = recurringBookingResponse.getNumberOfHours().toString();
            String packageDurationMonths = recurringBookingResponse.getPackageDurationMonths().toString();
            String price = convertToVietnamMoney(recurringBookingResponse.getTotalPrice());

            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("fieldName", fieldName);
            context.setVariable("startDate", startDate);
            context.setVariable("startTime", startTime);
            context.setVariable("endDate", endDate);
            context.setVariable("endTime", endTime);
            context.setVariable("interval", interval);
            context.setVariable("numberOfHours", numberOfHours);
            context.setVariable("packageDurationMonths", packageDurationMonths);
            context.setVariable("price", price);
            sendEmail(email,
                    "Sport Center - Recurring Booking Confirmation",
                    "RecurringBookingTemplate",
                    context);

        } catch (Exception e) {
            throw new CustomException("Error sending recurring booking mail: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public void sendMailRecurringBookingCancel(String email, String fullName, CancelRecurringInfo cancelRecurringInfo) {
        try {
            RecurringBookingResponse recurringBookingResponse = cancelRecurringInfo.getResponse();
            String fieldName = recurringBookingResponse.getField().getFieldName();
            String startDate = convertToVietnamTime(recurringBookingResponse.getStartDate());
            String startTime = convertToVietnamTime(recurringBookingResponse.getStartTime());
            List<TimeSlot> timeSlots = recurringBookingResponse.getTimeSlots();
            TimeSlot lastTimeSlot = (timeSlots != null && !timeSlots.isEmpty())
                    ? timeSlots.get(timeSlots.size() - 1)
                    : null;

            assert lastTimeSlot != null;
            String endDate = convertToVietnamTime(lastTimeSlot.getStartTime());
            String endTime = convertToVietnamTime(lastTimeSlot.getEndTime());

            String interval = recurringBookingResponse.getInterval().name(); // DAILY, WEEKLY, MONTHLY
            String numberOfHours = recurringBookingResponse.getNumberOfHours().toString();
            Double price = recurringBookingResponse.getTotalPrice();
            Integer durationMonths = recurringBookingResponse.getPackageDurationMonths();
            String duration = durationMonths.toString();
            String refund = convertToVietnamMoney(cancelRecurringInfo.getRefund());

            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("fieldName", fieldName);
            context.setVariable("startDate", startDate);
            context.setVariable("startTime", startTime);
            context.setVariable("endDate", endDate);
            context.setVariable("endTime", endTime);
            context.setVariable("interval", interval);
            context.setVariable("numberOfHours", numberOfHours);
            context.setVariable("price", price);
            context.setVariable("refund", refund);
            context.setVariable("duration", duration);
            sendEmail(email, "Sport Center - Recurring Booking Cancellation Confirmation", "CancelRecurringTemplate", context);

        } catch (Exception e) {
            throw new CustomException("Error sending cancel recurring booking mail: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public void sendMailCancelBooking(String email, String fullName, BookingResponse canceledBooking) {
        try {
            String bookingDate = convertToVietnamTime(canceledBooking.getBookingDate());
            String startTime = convertToVietnamTime(canceledBooking.getStartTime());
            String endTime = convertToVietnamTime(canceledBooking.getEndTime());
            double priceDouble = canceledBooking.isRecurring() ? 0.0 : canceledBooking.getTotalPrice();
            String price =  convertToVietnamMoney(priceDouble);

            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("bookingDate", bookingDate);
            context.setVariable("startTime", startTime);
            context.setVariable("endTime", endTime);
            context.setVariable("price", price);
            sendEmail(email, "Sport Center - Booking Cancellation", "CancelBookingTemplate", context);

        } catch (Exception e) {
            throw new CustomException("Error sending cancel booking email: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public void sendMailRegisterTournament(String toEmail, TournamentResponse tournament, TeamResponse team) {
        try {
            String startDate = convertToVietnamTime(tournament.getStartDate());
            String endDate = convertToVietnamTime(tournament.getEndDate());

            Context context = new Context();
            context.setVariable("teamName", team.getTeamName());
            context.setVariable("tournamentName", tournament.getTournamentName());
            context.setVariable("startDate", startDate);
            context.setVariable("endDate", endDate);
            context.setVariable("players", team.getPlayers());
            sendEmail(toEmail,
                    "Sport Center - Successfully registered for the tournament.",
                    "RegisterTournamentTemplate",
                    context);
        } catch (Exception e) {
            throw new CustomException("Error sending register tournament email: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public void sendMailUnregisterTournament(String toEmail, TournamentResponse tournament, TeamResponse team) {
        try {
            String startDate = convertToVietnamTime(tournament.getStartDate());
            String endDate = convertToVietnamTime(tournament.getEndDate());

            Context context = new Context();
            context.setVariable("teamName", team.getTeamName());
            context.setVariable("tournamentName", tournament.getTournamentName());
            context.setVariable("startDate", startDate);
            context.setVariable("endDate", endDate);
            sendEmail(toEmail, "Sport Center - Successfully unregistered from the tournament.",
                    "UnregisterTournamentTemplate", context);
        } catch (Exception e) {
            throw new CustomException("Error sending unregister tournament email: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }
}

