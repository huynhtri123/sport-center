package app.sportcenter.models.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyResponse {
    @JsonProperty("User Id")
    private String id;
    @JsonProperty("ExpiredAt")
    private ZonedDateTime expiredAt;
}
