package app.sportcenter.services;

import java.time.ZonedDateTime;

public interface FieldStatusByDateService {

    public boolean checkAvailable(String fieldId, ZonedDateTime startTime, ZonedDateTime endTime);

}
