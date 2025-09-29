package app.sportcenter.models.entities;

import app.sportcenter.commons.DiscountType;
import app.sportcenter.models.dto.request.AmountDiscount;
import app.sportcenter.models.dto.request.MonthDiscount;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;


@Document(collection = "discount_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class DiscountConfig extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    private DiscountType type;

    private AmountDiscount amountDiscount;

    private List<MonthDiscount> monthDiscountList;

}
