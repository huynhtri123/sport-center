package app.sportcenter.services;

import app.sportcenter.models.dto.request.DiscountConfigRequest;
import app.sportcenter.models.dto.response.DiscountConfigResponse;

import java.util.List;

public interface DiscountService {

    List<DiscountConfigResponse> getAllActive();

    DiscountConfigResponse getById(String id);

    DiscountConfigResponse create(DiscountConfigRequest request);

    DiscountConfigResponse updateById(String id, DiscountConfigRequest request);

    DiscountConfigResponse softDelete(String id);

    DiscountConfigResponse restore(String id);
}
