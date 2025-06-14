package app.sportcenter.models.dto.response;

import app.sportcenter.commons.DiscountType;
import app.sportcenter.models.dto.request.AmountDiscount;
import app.sportcenter.models.dto.request.MonthDiscount;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class DiscountConfigResponse extends BaseResponseDTO {

    private DiscountType type;

    private AmountDiscount amountDiscount;

    private List<MonthDiscount> monthDiscountList;
}
