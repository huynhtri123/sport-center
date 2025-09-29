package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.response.RegisterOrderResponse;
import app.sportcenter.models.entities.RegisterOrder;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RegisterOrderMapper {
    private final ModelMapper mapper;

    public RegisterOrderResponse convertToResponse(RegisterOrder registerOrder) {
        return mapper.map(registerOrder, RegisterOrderResponse.class);
    }
}
