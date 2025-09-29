package app.sportcenter.models.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "black_list_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BlackListToken {
    @Id
    private String id;

    private String token;

    private boolean isRevoked;
}
