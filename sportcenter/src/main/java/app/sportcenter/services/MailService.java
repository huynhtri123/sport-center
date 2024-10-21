package app.sportcenter.services;

import app.sportcenter.models.dto.BookingResponse;

public interface MailService {
    public void sendMailVerify(String toEmail, String userName, String verifyCode);
    public void sendMailBooking(String toEmail, String fullName, String bookingDate, String numberOfHours,
                                String startTime, String endTime, String totalPrice);
}
