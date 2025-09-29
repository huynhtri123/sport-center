package app.sportcenter.models.dto.request;

import java.time.ZonedDateTime;

public class MatchSlot {
    public ZonedDateTime start;
    public ZonedDateTime end;
    public String teamA;
    public String teamB;

    public MatchSlot(ZonedDateTime start, ZonedDateTime end, String teamA, String teamB) {
        this.start = start;
        this.end = end;
        this.teamA = teamA;
        this.teamB = teamB;
    }
}
