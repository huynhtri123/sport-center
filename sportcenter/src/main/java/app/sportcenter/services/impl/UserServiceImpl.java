package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.PaymentRequest;
import app.sportcenter.models.dto.PaymentResponse;
import app.sportcenter.models.dto.UserRequest;
import app.sportcenter.models.dto.UserResponse;
import app.sportcenter.models.entities.PaymentInfo;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.PaymentInfoRepository;
import app.sportcenter.repositories.UserRepository;
import app.sportcenter.services.UserService;
import app.sportcenter.utils.mappers.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.swing.text.html.HTML;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    @Autowired
    private PaymentInfoRepository paymentInfoRepository;


    @Override
    public UserDetailsService userDetailsService() {
        return new UserDetailsService() {
            @Override
            public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                return userRepository.getUserByEmail(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found!"));
            }
        };
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.getUserByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
    }

    @Override
    public ResponseEntity<BaseResponse> updateInfoCurrentUser(UserRequest userRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        if (userRequest == null) {
            throw new CustomException("User input is null", HttpStatus.BAD_REQUEST.value());
        }
        currentUser.setFullName(userRequest.getFullName());
        currentUser.setPhoneNumber(userRequest.getPhoneNumber());
        currentUser.setAddress(userRequest.getAddress());
        currentUser.setDateOfBirth(userRequest.getDateOfBirth());
        currentUser.setAvatarUrl(userRequest.getAvatarUrl());
        User updatedUser = userRepository.save(currentUser);

        UserResponse responseUser = userMapper.convertToDTO(currentUser);
        return ResponseEntity.ok(
                new BaseResponse("Update profile successfully!", HttpStatus.OK.value(), responseUser)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getCurrentProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new NotFoundException("Không tìm thấy người dùng đang đăng nhập!");
        }

        UserResponse responseUser = userMapper.convertToDTO(currentUser);
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy thông tin người dùng hiện tại", HttpStatus.OK.value(), responseUser)
        );
    }



//    @Override
//    public ResponseEntity<BaseResponse> getById(String id) {
//        User user = userRepository.findById(id).orElseThrow(() -> new CustomException("Người dùng không tồn tại", HttpStatus.NOT_FOUND.value()));
//        UserResponse response = new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhoneNumber(), user.getAddress(), user.getDateOfBirth(), user.getAvatarUrl(), user.getRole(), user.getCart(), user.getPaymentInfos());
//        return ResponseEntity.ok(new BaseResponse("Tìm thấy người dùng", HttpStatus.OK.value(), response));
//    }


//    @Override
//    public ResponseEntity<BaseResponse> delete(String id) {
//        User user = userRepository.findById(id).orElseThrow(() -> new CustomException("Người dùng không tồn tại", HttpStatus.NOT_FOUND.value()));
//        userRepository.delete(user);
//        return ResponseEntity.ok(new BaseResponse("Xóa người dùng thành công", HttpStatus.OK.value(), null));
//    }

//    @Override
//    public ResponseEntity<BaseResponse> getAll() {
//        List<User> users = userRepository.findAll();
//        List<UserResponse> responses = users.stream()
//                .map(user -> new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPassword(), user.getPhoneNumber(), user.getAddress(), user.getDateOfBirth(), user.getAvatarUrl(), user.getRole(), user.getCart(), user.getPaymentInfos()))
//                .collect(Collectors.toList());
//
//        return ResponseEntity.ok(new BaseResponse("Danh sách người dùng", HttpStatus.OK.value(), responses));
//    }
    @Override
    public ResponseEntity<BaseResponse> getAll() {
        List<User> userList = userRepository.findByIsDeletedFalseAndIsActiveTrue();

        if (userList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Không tìm thấy người dùng", HttpStatus.OK.value(), null)
            );
        }

        List<UserResponse> userResponseList = userList.stream()
                .map(userMapper::convertToDTO)
                .toList();

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Danh sách người dùng", HttpStatus.OK.value(), userResponseList)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> softDelete(String id) {
        // Retrieve the user by ID
        User user = userRepository.findById(id).orElse(null);

        // Check if the user exists
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy người dùng để xóa", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        // Mark the user as deleted
        user.setIsDeleted(true);
        userRepository.save(user);

        // Convert the user entity to a DTO for the response (if necessary)
        UserResponse responseUser = userMapper.convertToDTO(user);

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Xóa thành công người dùng", HttpStatus.OK.value(), responseUser)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> addPaymentInfoToUser(String userId, PaymentRequest paymentRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        // Tạo mới đối tượng PaymentInfo và thiết lập các thuộc tính
        PaymentInfo paymentInfo = new PaymentInfo();
        paymentInfo.setBankName(paymentRequest.getBankName());
        paymentInfo.setCardNumber(paymentRequest.getCardNumber());
        paymentInfo.setCardHolderName(paymentRequest.getCardHolderName());
        paymentInfo.setIssueDate(paymentRequest.getIssueDate());
        paymentInfo.setUserId(userId); // Lưu ID của user vào paymentInfo

        // Lưu PaymentInfo vào cơ sở dữ liệu
        user.getPaymentInfos().add(paymentInfo);
        paymentInfoRepository.save(paymentInfo);
        userRepository.save(user);

        // Tạo PaymentResponse để trả về
        PaymentResponse paymentResponse = new PaymentResponse(
                paymentInfo.getBankName(),
                paymentInfo.getCardNumber(),
                paymentInfo.getCardHolderName(),
                paymentInfo.getIssueDate(),
                userId
        );

        // Trả về response
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("thêm thành công người phương thức thanh toán", HttpStatus.OK.value(), paymentResponse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> removePaymentInfoFromUser(String userId, String paymentInfoId) {
        // Find the user by userId
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        // Find the payment info by paymentInfoId
        PaymentInfo paymentInfo = paymentInfoRepository.findById(paymentInfoId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thanh toán với ID: " + paymentInfoId));

        // Remove the payment info from the user's list of payment information
        user.getPaymentInfos().remove(paymentInfo);

        // Save the updated user to the repository
        userRepository.save(user);

        // Delete the payment info from the paymentInfo repository
        paymentInfoRepository.delete(paymentInfo);

        // Return a response indicating success
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Xóa thông tin thanh toán thành công", HttpStatus.OK.value(), null)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> updatePaymentInfoForUser(String userId, String paymentInfoId, PaymentRequest paymentRequest) {
        // Find the user by userId
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        // Find the payment info by paymentInfoId
        PaymentInfo paymentInfo = paymentInfoRepository.findById(paymentInfoId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thanh toán với ID: " + paymentInfoId));

        // Update the payment info fields with the new values
        paymentInfo.setBankName(paymentRequest.getBankName());
        paymentInfo.setCardNumber(paymentRequest.getCardNumber());
        paymentInfo.setCardHolderName(paymentRequest.getCardHolderName());
        paymentInfo.setIssueDate(paymentRequest.getIssueDate());

        // Save the updated payment info back to the repository
        paymentInfoRepository.save(paymentInfo);

        // Create a PaymentResponse to return
        PaymentResponse paymentResponse = new PaymentResponse(
                paymentInfo.getBankName(),
                paymentInfo.getCardNumber(),
                paymentInfo.getCardHolderName(),
                paymentInfo.getIssueDate(),
                userId
        );

        // Return a success response with the updated payment info
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Cập nhật thông tin thanh toán thành công", HttpStatus.OK.value(), paymentResponse)
        );
    }







}
