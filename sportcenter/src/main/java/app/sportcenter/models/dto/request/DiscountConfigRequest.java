package app.sportcenter.models.dto.request;

import app.sportcenter.commons.DiscountType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class DiscountConfigRequest extends BaseRequestDTO {

    @NotNull(message = "Discount type must not be null")
    private DiscountType type;

    @Valid
    private AmountDiscount amountDiscount;

    @Valid
    private List<MonthDiscount> monthDiscountList;
}




