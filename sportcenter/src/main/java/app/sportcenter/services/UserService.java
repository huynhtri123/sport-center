package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.PaymentRequest;
import app.sportcenter.models.dto.UserRequest;
import app.sportcenter.models.dto.UserResponse;
import app.sportcenter.models.entities.PaymentInfo;
import app.sportcenter.models.entities.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface UserService {
    public UserDetailsService userDetailsService();
    public User getUserByEmail(String email);
    public ResponseEntity<BaseResponse> updateInfoCurrentUser(UserRequest userRequest);
    public ResponseEntity<BaseResponse> getCurrentProfile();
    ResponseEntity<BaseResponse> softDelete(String id);
    ResponseEntity<BaseResponse> getAll();
    public ResponseEntity<BaseResponse> addPaymentInfoToUser(String userId, PaymentRequest paymentRequest);
    ResponseEntity<BaseResponse> removePaymentInfoFromUser(String userId, String paymentInfoId);
    ResponseEntity<BaseResponse> updatePaymentInfoForUser(String userId, String paymentInfoId, PaymentRequest paymentRequest);
    public ResponseEntity<BaseResponse> getAccountBalance();
    public ResponseEntity<BaseResponse> makePaymentByBalance(Double amountToPay);
    public boolean refund(User user, Double price);

    public UserResponse getCurrentUser();

}
