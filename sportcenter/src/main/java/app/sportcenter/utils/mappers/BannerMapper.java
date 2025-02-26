package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.response.BannerResponse;
import app.sportcenter.models.entities.Banner;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BannerMapper {
    private final ModelMapper modelMapper;

    public BannerResponse convertToResponse(Banner banner) {
        return modelMapper.map(banner, BannerResponse.class);
    }
}
