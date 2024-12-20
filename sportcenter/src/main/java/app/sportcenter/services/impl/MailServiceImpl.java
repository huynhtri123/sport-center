package app.sportcenter.services.impl;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.BookingResponse;
import app.sportcenter.models.dto.TeamResponse;
import app.sportcenter.models.entities.Team;
import app.sportcenter.services.MailService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.ZonedDateTime;

@Service
public class MailServiceImpl implements MailService {
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private TemplateEngine templateEngine;

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

    @Override
    public void sendMailVerify(String toEmail, String userName, String verifyCode, String templateFile) {
        Context context = new Context();
        context.setVariable("UserName", userName);
        context.setVariable("ToEmail", toEmail);
        context.setVariable("VerifyCode", verifyCode);
        sendEmail(toEmail, "Sport Center - Verification code", templateFile, context);
    }

    @Override
    public void sendMailBooking(String toEmail, String fullName, String bookingDate, String numberOfHours,
                                String startTime, String endTime, String totalPrice, String templateFile) {
        Context context = new Context();
        context.setVariable("fullName", fullName);
        context.setVariable("toEmail", toEmail);
        context.setVariable("bookingDate", bookingDate);
        context.setVariable("numberOfHours", numberOfHours);
        context.setVariable("startTime", startTime);
        context.setVariable("endTime", endTime);
        context.setVariable("totalPrice", totalPrice);
        sendEmail(toEmail, "Sport Center - Booking", templateFile, context);
    }

    @Override
    public void sendMailRecurringBooking(String toEmail, String fullName, String fieldName, String startDate,
                                         String startTime, String endDate, String endTime, String interval,
                                         String numberOfHours, String packageDurationMonths, String price,
                                         String templateFile) {
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
        sendEmail(toEmail, "Sport Center - Recurring Booking Confirmation", templateFile, context);
    }

    @Override
    public void sendMailRecurringBookingCancel(String toEmail, String fullName, String fieldName,
                                               String startDate, String startTime, String endDate,
                                               String endTime, String interval, String numberOfHours,
                                               Double price, Double refund, String duration, String templateFile) {
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
        sendEmail(toEmail, "Sport Center - Recurring Booking Cancellation Confirmation", templateFile, context);
    }

    @Override
    public void sendMailCancelBooking(String toEmail, String fullName, String bookingDate,
                                      String startTime, String endTime, String price, String templateFile) {
        Context context = new Context();
        context.setVariable("fullName", fullName);
        context.setVariable("bookingDate", bookingDate);
        context.setVariable("startTime", startTime);
        context.setVariable("endTime", endTime);
        context.setVariable("price", price);
        sendEmail(toEmail, "Sport Center - Booking Cancellation", templateFile, context);
    }

    @Override
    public void sendMailRegisterTournament(String toEmail, String tournamentName,
                                           ZonedDateTime startDate, ZonedDateTime endDate, TeamResponse team,
                                           String templateFile) {
        Context context = new Context();
        context.setVariable("teamName", team.getTeamName());
        context.setVariable("tournamentName", tournamentName);
        context.setVariable("startDate", startDate.toString());
        context.setVariable("endDate", endDate.toString());
        context.setVariable("players", team.getPlayers());
        sendEmail(toEmail, "Sport Center - Successfully registered for the tournament.", templateFile, context);
    }

    @Override
    public void sendMailUnregisterTournament(String toEmail, String tournamentName,
                                             ZonedDateTime startDate, ZonedDateTime endDate, TeamResponse team,
                                             String templateFile) {
        Context context = new Context();
        context.setVariable("teamName", team.getTeamName());
        context.setVariable("tournamentName", tournamentName);
        context.setVariable("startDate", startDate.toString());
        context.setVariable("endDate", endDate.toString());
        sendEmail(toEmail, "Sport Center - Successfully unregistered from the tournament.", templateFile, context);
    }
}

