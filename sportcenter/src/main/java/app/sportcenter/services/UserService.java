package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.response.InvoiceResponse;
import app.sportcenter.models.dto.request.PaymentRequest;
import app.sportcenter.models.dto.request.UserRequest;
import app.sportcenter.models.dto.response.UserResponse;
import app.sportcenter.models.entities.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService {

    public UserDetailsService userDetailsService();

    public User getUserByEmail(String email);

    public ResponseEntity<BaseResponse> updateInfoCurrentUser(UserRequest userRequest);

    public ResponseEntity<BaseResponse> getCurrentProfile();

    ResponseEntity<BaseResponse> softDelete(String id);

    ResponseEntity<BaseResponse> restore(String id);

    ResponseEntity<BaseResponse> getAllActive(int page, int size);

    ResponseEntity<BaseResponse> getAll(int page, int size);

    public ResponseEntity<BaseResponse> addPaymentInfoToUser(String userId, PaymentRequest paymentRequest);

    ResponseEntity<BaseResponse> removePaymentInfoFromUser(String userId, String paymentInfoId);

    ResponseEntity<BaseResponse> updatePaymentInfoForUser(String userId, String paymentInfoId, PaymentRequest paymentRequest);

    public ResponseEntity<BaseResponse> getAccountBalance();

    public InvoiceResponse makePaymentByBalance(Double amountToPay, String transactionType);

    public boolean refund(User user, Double price);

    public UserResponse getCurrentUser(HttpServletRequest request);

    public UserResponse getUserById(String userId);


    public ResponseEntity<BaseResponse> getInvoicesForCurrentUser();

    public ResponseEntity<BaseResponse> deleteInvoice(String invoiceId);

    public List<UserResponse> getAllActive();

    public Page<User> searchUsersByName(String name, Pageable pageable);

}
