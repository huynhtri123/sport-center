package app.sportcenter.utils.ai;

import app.sportcenter.configs.AppConfig;
import app.sportcenter.models.dto.response.BookingData;
import app.sportcenter.models.entities.Booking;
import app.sportcenter.models.entities.Field;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIUtil {

    private final AppConfig appConfig;
    private final RestTemplate restTemplate;

    public BookingData convertToData(Booking booking) {
        Field field = booking.getField();
        int dayOfWeek = booking.getStartTime().getDayOfWeek().getValue();
        int hour = booking.getStartTime().getHour();
        int month = booking.getStartTime().getMonthValue();
        double price = field.getPriceForDay(dayOfWeek);

        BookingData bookingData = new BookingData();
        bookingData.setField_id(field.getId());
        bookingData.setSport_id(field.getSport().getId());
        bookingData.setDay_of_week(dayOfWeek);
        bookingData.setHour(hour);
        bookingData.setMonth(month);
        bookingData.setPrice(price);

        return bookingData;
    }

    public void retrainModel() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(appConfig.getAiRetrainUrl(), request, String.class);
            log.info("AI retrain response: {}", response.getBody());
        } catch (Exception e) {
            log.error("Lỗi khi gọi retrain AI: {}", e.getMessage(), e);
        }
    }

    @Async
    public void addOneRow(Booking booking) {
        BookingData bookingData = convertToData(booking);
        // Gói JSON và Header
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<BookingData> request = new HttpEntity<>(bookingData, headers);
        ResponseEntity<String> aiResponse = restTemplate.postForEntity(appConfig.getAiAddDataUrl(), request, String.class);
        log.info(String.valueOf(aiResponse));

        retrainModel();
    }

    @Async
    public void addRows(List<Booking> bookings) {
        List<BookingData> dataList = bookings.stream()
                .map(this::convertToData)
                .collect(Collectors.toList());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<List<BookingData>> request = new HttpEntity<>(dataList, headers);

        try {
            ResponseEntity<String> aiResponse = restTemplate.postForEntity(appConfig.getAiAddDataUrl(), request, String.class);
            if (aiResponse.getStatusCode().is2xxSuccessful()) {
                retrainModel();
            } else {
                log.error("Gửi dữ liệu thất bại, không gọi retrain.");
            }
        } catch (Exception e) {
            log.error("Lỗi khi gửi dữ liệu hàng loạt đến AI: {}", e.getMessage(), e);
        }
    }

}
