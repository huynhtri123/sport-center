package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.request.DiscountConfigRequest;
import app.sportcenter.models.dto.response.DiscountConfigResponse;
import app.sportcenter.models.entities.DiscountConfig;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class DiscountConfigMapper {

    private final ModelMapper mapper;

    public DiscountConfigMapper() {
        this.mapper = new ModelMapper();

        // Cấu hình map cho list AmountDiscount
        mapper.createTypeMap(DiscountConfigRequest.class, DiscountConfig.class).addMappings(mapper -> {
            mapper.map(DiscountConfigRequest::getAmountDiscount, DiscountConfig::setAmountDiscount);
            mapper.map(DiscountConfigRequest::getMonthDiscountList, DiscountConfig::setMonthDiscountList);
        });

        mapper.createTypeMap(DiscountConfig.class, DiscountConfigResponse.class).addMappings(mapper -> {
            mapper.map(DiscountConfig::getAmountDiscount, DiscountConfigResponse::setAmountDiscount);
            mapper.map(DiscountConfig::getMonthDiscountList, DiscountConfigResponse::setMonthDiscountList);
        });
    }

    public DiscountConfig convertToEntity(DiscountConfigRequest request) {
        return mapper.map(request, DiscountConfig.class);
    }

    public DiscountConfigResponse convertToResponse(DiscountConfig discountConfig) {
        return mapper.map(discountConfig, DiscountConfigResponse.class);
    }
}

