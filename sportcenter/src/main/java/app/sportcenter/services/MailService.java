package app.sportcenter.services;

import app.sportcenter.models.dto.response.TeamResponse;

import java.time.ZonedDateTime;

public interface MailService {
    public void sendMailVerify(String toEmail, String userName, String verifyCode, String templateFile);

    public void sendMailBooking(String toEmail, String fullName, String bookingDate, String numberOfHours,
                                String startTime, String endTime, String totalPrice, String templateFile);

    public void sendMailRecurringBooking(String toEmail, String fullName, String fieldName,
                                         String startDate, String startTime, String endDate,
                                         String endTime, String interval, String numberOfHours,
                                         String packageDurationMonths, String price, String templateFile);

    public void sendMailRecurringBookingCancel(String toEmail, String fullName,
                                               String fieldName,
                                               String startDate, String startTime,
                                               String endDate, String endTime, String interval,
                                               String numberOfHours,
                                               Double price, Double refund, String duration, String templateFile);

    public void sendMailCancelBooking(String toEmail, String fullName, String bookingDate,
                                      String startTime, String endTime, String price, String templateFile);

    public void sendMailRegisterTournament(String toEmail, String tournamentName,
                                           ZonedDateTime startDate, ZonedDateTime endDate,
                                           TeamResponse team, String templateFile);

    public void sendMailUnregisterTournament(String toEmail, String tournamentName, ZonedDateTime startDate,
                                             ZonedDateTime endDate, TeamResponse team, String templateFile);
}

