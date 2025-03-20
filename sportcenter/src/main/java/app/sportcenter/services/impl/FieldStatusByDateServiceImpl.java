package app.sportcenter.services.impl;

import app.sportcenter.models.entities.FieldStatusByDate;
import app.sportcenter.models.entities.TimeSlot;
import app.sportcenter.repositories.FieldStatusByDateRepository;
import app.sportcenter.services.FieldStatusByDateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FieldStatusByDateServiceImpl implements FieldStatusByDateService {

    private final FieldStatusByDateRepository repository;

    @Override
    public boolean checkAvailable(String fieldId, ZonedDateTime startTime, ZonedDateTime endTime) {
        startTime = startTime.minusHours(7);
        endTime = endTime.minusHours(7);

        // Kiểm tra xem có timeSlot nào đang IN_USE không
        List<FieldStatusByDate> conflicts = repository.findInUseTimeSlotsByFieldAndTimeRange(fieldId, startTime, endTime);

        return conflicts.isEmpty();  // Nếu không có xung đột -> Có thể đặt sân
    }

}
