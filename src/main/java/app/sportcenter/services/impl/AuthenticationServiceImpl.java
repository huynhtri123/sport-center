package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.Role;
import app.sportcenter.configs.AppConfig;
import app.sportcenter.models.dto.*;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.UserRepository;
import app.sportcenter.services.AuthenticationService;
import app.sportcenter.services.JWTService;
import app.sportcenter.utils.mappers.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AppConfig appConfig;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;

    @Override
    public void autoCreateAdminAccount() {
        if (!userRepository.existsByRole(Role.ADMIN)) {
            User admin = new User();
            admin.setFullName("ADMIN");
            admin.setEmail(appConfig.getAdminEmail());
            admin.setPassword(passwordEncoder.encode(appConfig.getAdminPassword()));
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);
            log.info("Admin account created with email: {}", admin.getEmail());
        } else {
            log.info("Admin account already exists.");
        }
    }

    private boolean checkMatchPassword(String password, String passwordConfirm) {
        if (!password.equals(passwordConfirm)) {
            log.warn("Password and confirm password are not matched!");
            return false;
        }
        return true;
    }

    @Override
    public ResponseEntity<BaseResponse> signup(SignupRequest signupRequest) {
        // kiểm tra xem email đã tồn tại chưa
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new IllegalArgumentException("Email đã tồn tại!");
        }

        // check mật khẩu và xác nhận mật khẩu
        if (!checkMatchPassword(signupRequest.getPassword(), signupRequest.getPasswordConfirm())) {
            throw new IllegalArgumentException("Mật khẩu và xác nhận mật khẩu không khớp");
        }

        User user = new User();
        user.setFullName(signupRequest.getFullName());
        user.setEmail(signupRequest.getEmail());
        user.setRole(Role.CUSTOMER);
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

        UserResponse userResponse = userMapper.convertToDTO(userRepository.save(user));

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Đăng ký tài khoản thành công",
                        HttpStatus.OK.value(),
                        userResponse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> signin(SigninRequest signinRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signinRequest.getEmail(), signinRequest.getPassword())
        );
        var user = userRepository.getUserByEmail(signinRequest.getEmail())
                .orElseThrow(()-> new IllegalArgumentException("Invalid email or password!"));
        var jwt = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(new HashMap<>(), user);

        JWTAuthResponse jwtAuthResponse = new JWTAuthResponse();
        jwtAuthResponse.setEmail(user.getEmail());
        jwtAuthResponse.setTokenType("Bearer");
        jwtAuthResponse.setToken(jwt);
        jwtAuthResponse.setRefreshToken(refreshToken);

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Đăng nhập thành công",
                        HttpStatus.OK.value(),
                        jwtAuthResponse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> refreshToken(RefreshTokenRequest refreshTokenRequest) {
        String userEmail = jwtService.extractUserName(refreshTokenRequest.getToken());
        User user = userRepository.getUserByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (jwtService.isValidToken(refreshTokenRequest.getToken(), user)){
            var jwt = jwtService.generateToken(user);

            JWTAuthResponse jwtAuthResponse = new JWTAuthResponse();
            jwtAuthResponse.setEmail(user.getEmail());
            jwtAuthResponse.setTokenType("Bearer");
            jwtAuthResponse.setToken(jwt);
            jwtAuthResponse.setRefreshToken(refreshTokenRequest.getToken());

            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Refresh token successfully", HttpStatus.OK.value(), jwtAuthResponse)
            );
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new BaseResponse("Invalid refresh token", HttpStatus.UNAUTHORIZED.value(), null)
        );
    }


}
