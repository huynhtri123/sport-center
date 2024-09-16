package app.sportcenter.models.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class BaseResponseDTO {
    private String id;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private Boolean isActive;
    private Boolean isDeleted;
}
