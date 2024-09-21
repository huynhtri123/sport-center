package app.sportcenter.services;

public interface MailService {
    public void sendMailVerify(String toEmail, String userName, String verifyCode);
}
