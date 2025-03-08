package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.request.RecurringBookingRequest;
import app.sportcenter.models.dto.response.RecurringBookingResponse;
import app.sportcenter.models.entities.Field;
import app.sportcenter.models.entities.RecurringBooking;
import app.sportcenter.models.entities.User;
import org.springframework.stereotype.Component;

@Component
public class RecurringBookingMapper {

    public RecurringBooking convertToEntity(RecurringBookingRequest request, Field field, User user) {
        return RecurringBooking.builder()
                .field(field)
                .user(user)
                .startDate(request.getStartDate())
                .startTime(request.getStartTime())
                .interval(request.getInterval())
                .numberOfHours(request.getNumberOfHours())
                .packageDurationMonths(request.getPackageDurationMonths())
                .build();
    }

    public RecurringBookingResponse convertToDTO(RecurringBooking recurringBooking) {
        RecurringBookingResponse response = RecurringBookingResponse.builder()
                .id(recurringBooking.getId())
                .field(recurringBooking.getField())
                .userId(recurringBooking.getUser().getId())
                .startDate(recurringBooking.getStartDate())
                .startTime(recurringBooking.getStartTime())
                .interval(recurringBooking.getInterval())
                .numberOfHours(recurringBooking.getNumberOfHours())
                .packageDurationMonths(recurringBooking.getPackageDurationMonths())
                .build();

        response.setIsActive(recurringBooking.getIsActive());
        response.setIsDeleted(recurringBooking.getIsDeleted());
        response.setCreatedAt(recurringBooking.getCreatedAt());
        response.setUpdatedAt(recurringBooking.getUpdatedAt());
        response.setBookingIds(recurringBooking.getBookingIds());

        response.setEndTime(recurringBooking.getEndTime());
        response.setTotalPrice(recurringBooking.getTotalPrice());
        response.setTimeSlots(recurringBooking.getTimeSlots());

        return response;
    }
}
