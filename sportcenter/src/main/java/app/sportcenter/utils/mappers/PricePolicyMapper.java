package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.PricePolicyRequest;
import app.sportcenter.models.dto.PricePolicyResponse;
import app.sportcenter.models.entities.PricePolicy;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PricePolicyMapper {
    @Autowired
    private ModelMapper modelMapper;

    public PricePolicy convertToEntity(PricePolicyRequest pricePolicyRequest) {
        return pricePolicyRequest != null ? modelMapper.map(pricePolicyRequest, PricePolicy.class) : null;
    }

    public PricePolicyResponse convertToRespone(PricePolicy pricePolicy) {
       return pricePolicy != null ? modelMapper.map(pricePolicy, PricePolicyResponse.class) : null;
    }

}
