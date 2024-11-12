package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.UserRequest;
import app.sportcenter.models.dto.UserResponse;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.UserRepository;
import app.sportcenter.services.UserService;
import app.sportcenter.utils.mappers.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.swing.text.html.HTML;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;


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

    @Override
    public ResponseEntity<BaseResponse> getAccountBalance() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Double accountBalance = currentUser.getAccountBalance();

        return ResponseEntity.ok(
                new BaseResponse("Lấy số dư hiện tại thành công.", HttpStatus.OK.value(), accountBalance)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> makePaymentByBalance(Double amountToPay) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Double accountBalance = currentUser.getAccountBalance();
        if (accountBalance < amountToPay) {
            throw new CustomException("Thất bại. Số dư không đủ để thực hiện thanh toán!", HttpStatus.BAD_REQUEST.value());
        }

        currentUser.setAccountBalance(accountBalance - amountToPay);
        userRepository.save(currentUser);

        return ResponseEntity.ok(
                new BaseResponse("Thanh toán bằng số dư thành công!", HttpStatus.OK.value(),
                        currentUser.getAccountBalance())
        );
    }


}
