package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.UserResponse;
import app.sportcenter.models.entities.User;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    @Autowired
    private ModelMapper mapper;

    public UserResponse convertToDTO(User user) {
        return (user != null) ? mapper.map(user, UserResponse.class) : null;
    }
}
