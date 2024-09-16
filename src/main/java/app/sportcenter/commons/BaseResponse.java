package app.sportcenter.commons;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaseResponse {
    @JsonProperty("Message")
    private String message;
    @JsonProperty("Status")
    private int status;
    @JsonProperty("Data")
    private Object data;
}
