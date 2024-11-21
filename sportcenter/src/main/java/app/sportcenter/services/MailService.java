package app.sportcenter.services;

import app.sportcenter.models.dto.BookingResponse;
import app.sportcenter.models.entities.Team;

import java.time.ZonedDateTime;

public interface MailService {
    public void sendMailVerify(String toEmail, String userName, String verifyCode);

    public void sendMailBooking(String toEmail, String fullName, String bookingDate, String numberOfHours,
                                String startTime, String endTime, String totalPrice);
    public void sendMailRecurringBooking(String toEmail, String fullName, String fieldName,
                                         String startDate, String startTime, String endDate,
                                         String endTime, String interval, String numberOfHours,
                                         String packageDurationMonths, String price);
    public void sendMailRecurringBookingCancel(String toEmail, String fullName,
                                               String fieldName,
                                               String startDate, String startTime,
                                               String endDate, String endTime, String interval,
                                               String numberOfHours,
                                               Double price, Double refund, String duration);
    public void sendMailCancelBooking(String toEmail, String fullName, String bookingDate, String startTime, String endTime, String price);

    public void sendMailRegisterTournament(String toEmail, String tournamentName,
                                           ZonedDateTime startDate, ZonedDateTime endDate, Team team);
    public void sendMailUnregisterTournament(String toEmail, String tournamentName, ZonedDateTime startDate, ZonedDateTime endDate, Team team);
}
