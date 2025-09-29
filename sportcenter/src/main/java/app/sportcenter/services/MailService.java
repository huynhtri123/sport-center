package app.sportcenter.services;

import app.sportcenter.models.dto.response.*;
import app.sportcenter.models.entities.Prize;
import app.sportcenter.models.entities.Team;
import app.sportcenter.models.entities.Tournament;

public interface MailService {

    public void sendMailVerify(String toEmail, String userName, String verifyCode);

    public void sendMailBooking(String email, String fullName, BookingResponse bookingResponse);

    public void sendMailRecurringBooking(String email, String fullName, RecurringBookingResponse recurringBookingResponse);

    public void sendMailRecurringBookingCancel(String email, String fullName, CancelRecurringInfo cancelRecurringInfo);

    public void sendMailCancelBooking(String email, String fullName, BookingResponse canceledBooking);

    public void sendMailRegisterTournament(String toEmail, TournamentResponse tournament, TeamResponse team);

    public void sendMailUnregisterTournament(String toEmail, TournamentResponse tournament, TeamResponse team);

    public void sendMailWonTournament(String toEmail, Team team, Tournament tournament, Prize prize);

}

