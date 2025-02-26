package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.response.GalleryResponse;
import app.sportcenter.models.entities.Gallery;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GalleryMapper {
    private final ModelMapper modelMapper;

    public GalleryResponse convertToResponse(Gallery gallery) {
        return modelMapper.map(gallery, GalleryResponse.class);
    }
}
