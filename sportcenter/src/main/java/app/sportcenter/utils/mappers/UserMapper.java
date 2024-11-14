package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.PaymentRequest;
import app.sportcenter.models.dto.UserRequest;
import app.sportcenter.models.dto.UserResponse;
import app.sportcenter.models.entities.PaymentInfo;
import app.sportcenter.models.entities.User;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class UserMapper {
    @Autowired
    private ModelMapper mapper;

    public UserResponse convertToDTO(User user) {
        return (user != null) ? mapper.map(user, UserResponse.class) : null;
    }

    public PaymentInfo convertToEntity(PaymentRequest paymentInfoRequest) {
        if (paymentInfoRequest == null) return null;
        return mapper.map(paymentInfoRequest, PaymentInfo.class);
    }

    // Convert User entity to User DTO (optional for your use case)
    public User convertToEntity(UserRequest userRequest) {
        if (userRequest == null) return null;
        return mapper.map(userRequest, User.class);
    }

    public User addPaymentToUser(User user, PaymentInfo paymentInfo) {
        if (user == null || paymentInfo == null) return null;

        // Check if user already has a paymentInfos list, if not initialize it
        if (user.getPaymentInfos() == null) {
            user.setPaymentInfos(new ArrayList<>());
        }

        // Add the paymentInfo to the user's paymentInfos list
        user.getPaymentInfos().add(paymentInfo);

        return user;
    }



}
