package app.sportcenter.utils.kafkaUsage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageWrapper {
    private String type;
    private Object payload;
    private String toEmail;
    private String toFullName;
}
