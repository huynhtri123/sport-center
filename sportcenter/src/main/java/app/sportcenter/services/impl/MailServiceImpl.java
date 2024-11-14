package app.sportcenter.services.impl;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.BookingResponse;
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
    @Override
    public void sendMailVerify(String toEmail, String userName, String verifyCode) {
        MimeMessagePreparator preparator = new MimeMessagePreparator() {
            public void prepare(MimeMessage mimeMessage) throws Exception {
                MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                messageHelper.setTo(toEmail);
                messageHelper.setSubject("Sport Center - Mã xác minh");

                Context context = new Context();
                context.setVariable("UserName", userName);
                context.setVariable("ToEmail", toEmail);
                context.setVariable("VerifyCode", verifyCode);

                String content = templateEngine.process("VerifyTemplate", context);

                messageHelper.setText(content, true);
            }
        };
        mailSender.send(preparator);
    }

    @Override
    public void sendMailBooking(String toEmail, String fullName, String bookingDate, String numberOfHours, String startTime, String endTime, String totalPrice) {
        try {
            MimeMessagePreparator preparator = new MimeMessagePreparator() {
                public void prepare(MimeMessage mimeMessage) throws Exception {
                    MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    messageHelper.setTo(toEmail);
                    messageHelper.setSubject("Sport Center - Booking");

                    Context context = new Context();
                    context.setVariable("fullName", fullName);
                    context.setVariable("toEmail", toEmail);
                    context.setVariable("bookingDate", bookingDate);
                    context.setVariable("numberOfHours", numberOfHours);
                    context.setVariable("startTime", startTime);
                    context.setVariable("endTime", endTime);
                    context.setVariable("totalPrice", totalPrice);

                    String content = templateEngine.process("BookingTemplate", context);
                    messageHelper.setText(content, true);
                }
            };
            mailSender.send(preparator);

        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail booking: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public void sendMailRecurringBooking(String toEmail, String fullName, String fieldName, String startDate, String startTime, String endDate, String endTime, String interval, String numberOfHours, String packageDurationMonths, String price) {
        try {
            MimeMessagePreparator preparator = new MimeMessagePreparator() {
                public void prepare(MimeMessage mimeMessage) throws Exception {
                    MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    messageHelper.setTo(toEmail);
                    messageHelper.setSubject("Sport Center - Recurring Booking Confirmation");

                    // Khởi tạo các biến cho template email
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

                    // Render template email với Thymeleaf
                    String content = templateEngine.process("RecurringBookingTemplate", context);
                    messageHelper.setText(content, true);
                }
            };
            mailSender.send(preparator);

        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail đặt sân định kỳ: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }


    @Override
    public void sendMailCancelBooking(String toEmail, String fullName,
                                      String bookingDate, String startTime, String endTime, String price) {
        try {
            MimeMessagePreparator preparator = new MimeMessagePreparator() {
                public void prepare(MimeMessage mimeMessage) throws Exception {
                    MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    messageHelper.setTo(toEmail);
                    messageHelper.setSubject("Sport Center - Booking Cancellation");

                    Context context = new Context();
                    context.setVariable("fullName", fullName);
                    context.setVariable("bookingDate", bookingDate);
                    context.setVariable("startTime", startTime);
                    context.setVariable("endTime", endTime);
                    context.setVariable("price", price);

                    String content = templateEngine.process("CancelBookingTemplate", context);
                    messageHelper.setText(content, true);
                }
            };
            mailSender.send(preparator);

        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail huỷ booking: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }


    @Override
    public void sendMailRegisterTournament(String toEmail, String tournamentName, ZonedDateTime startDate, ZonedDateTime endDate, Team team) {
        MimeMessagePreparator preparator = new MimeMessagePreparator() {
            public void prepare(MimeMessage mimeMessage) throws Exception {
                MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                messageHelper.setTo(toEmail);
                messageHelper.setSubject("Sport Center - Đăng ký tham gia giải đấu thành công");

                Context context = new Context();
                context.setVariable("teamName", team.getTeamName());
                context.setVariable("tournamentName", tournamentName);
                context.setVariable("startDate", startDate.toString());
                context.setVariable("endDate", endDate.toString());
                context.setVariable("players", team.getPlayers());

                String content = templateEngine.process("RegisterTournamentTemplate", context);
                messageHelper.setText(content, true);
            }
        };
        try {
            mailSender.send(preparator);
        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail đăng ký giải đấu: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public void sendMailUnregisterTournament(String toEmail, String tournamentName, ZonedDateTime startDate, ZonedDateTime endDate, Team team) {
        // Gửi email thông báo hủy đăng ký
        MimeMessagePreparator preparator = new MimeMessagePreparator() {
            public void prepare(MimeMessage mimeMessage) throws Exception {
                MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                messageHelper.setTo(toEmail);
                messageHelper.setSubject("Sport Center - Hủy đăng ký giải đấu thành công");

                Context context = new Context();
                context.setVariable("teamName", team.getTeamName());
                context.setVariable("tournamentName", tournamentName);
                context.setVariable("startDate", startDate.toString());
                context.setVariable("endDate", endDate.toString());

                String content = templateEngine.process("UnregisterTournamentTemplate", context);
                messageHelper.setText(content, true);
            }
        };
        try {
            mailSender.send(preparator);
        } catch (Exception e) {
            throw new CustomException("Lỗi khi gửi mail hủy đăng ký giải đấu: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }


}
