package app.sportcenter.models.entities;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Data
public abstract class BaseEntity {
    private Boolean isActive = true;   //trạng thái hoạt động
    private Boolean isDeleted = false;  //trạng thái xoá mềm
    @CreatedDate
    private Instant createdAt;  //thời gian tạo
    @LastModifiedDate
    private Instant updatedAt;  //thời gian lần cập nhật gần nhất

    public ZonedDateTime getCreatedAt() {
        return createdAt != null ? createdAt.atZone(ZoneId.systemDefault()) : null;
    }

    public ZonedDateTime getUpdatedAt() {
        return updatedAt != null ? updatedAt.atZone(ZoneId.systemDefault()) : null;
    }

}
