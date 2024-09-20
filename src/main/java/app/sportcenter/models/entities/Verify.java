package app.sportcenter.models.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Verify {
    private String code;
    private ZonedDateTime expireAt;     // thời gian hết hạn
}
