package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.RecurringBookingRequest;
import app.sportcenter.models.dto.RecurringBookingResponse;
import app.sportcenter.models.entities.Field;
import app.sportcenter.models.entities.RecurringBooking;
import app.sportcenter.models.entities.User;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RecurringBookingMapper {

    @Autowired
    private ModelMapper modelMapper;

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

    public RecurringBooking updateFielAndUser(RecurringBooking recurringBooking, Field updatedField, User user) {
        recurringBooking.setField(updatedField);
        recurringBooking.setUser(user);

        return recurringBooking;
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

        // Thiết lập giá trị tính toán
        response.setEndDate(recurringBooking.getEndDate());
        response.setEndTime(recurringBooking.getEndTime());
        response.setPrice(recurringBooking.getPrice());
//        response.setRecurringDates(recurringBooking.generateRecurringDates());
//        response.setRecurringTimeSlots(recurringBooking.generateTimeSlots());

        return response;
    }
}
