package app.sportcenter.models.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class PlayerRequest extends BaseRequestDTO{
    @NotBlank(message = "Bạn chưa nhập tên cầu thủ!")
    private String name;
    @NotBlank(message = "Bạn chưa nập vị trí cầu thủ")
    private String position;
    @NotNull(message = "Bạn chưa nhập số áo của cầu thủ!")
    private Integer number;
}
