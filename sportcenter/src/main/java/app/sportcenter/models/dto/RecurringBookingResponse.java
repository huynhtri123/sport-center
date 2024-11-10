package app.sportcenter.models.dto;

import app.sportcenter.commons.RecurringIntervalType;
import app.sportcenter.models.entities.Field;
import app.sportcenter.models.entities.TimeSlot;
import app.sportcenter.models.entities.User;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Builder
public class RecurringBookingResponse extends BaseResponseDTO {
    private String id;
    private Field field;
    private String userId;
    private ZonedDateTime startDate;
    private ZonedDateTime startTime;
    private ZonedDateTime endDate;
    private ZonedDateTime endTime;
    private RecurringIntervalType interval;
    private Integer numberOfHours;
    private Integer packageDurationMonths;
    private Double price;
//    private List<ZonedDateTime> recurringDates;
    private List<TimeSlot> recurringTimeSlots;
}
