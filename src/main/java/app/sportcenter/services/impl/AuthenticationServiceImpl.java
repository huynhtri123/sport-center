package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.Role;
import app.sportcenter.configs.AppConfig;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.*;
import app.sportcenter.models.entities.User;
import app.sportcenter.models.entities.Verify;
import app.sportcenter.repositories.UserRepository;
import app.sportcenter.services.AuthenticationService;
import app.sportcenter.services.JWTService;
import app.sportcenter.services.MailService;
import app.sportcenter.services.UserService;
import app.sportcenter.utils.mappers.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppConfig appConfig;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;
    private final MailService mailService;
    private final UserMapper userMapper;
    private final UserService userService;

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

    private String getVerifyCode() {
        StringBuilder verifyCode = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 6; i++) {
            verifyCode.append(random.nextInt(10));
        }
        return verifyCode.toString();
    }

    @Transactional
    @Override
    public VerifyResponse signup(SignupRequest signupRequest) {
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

        String verifyCode = getVerifyCode();
        Verify verify = new Verify(BCrypt.hashpw(verifyCode, BCrypt.gensalt(appConfig.getLogRounds())),
                ZonedDateTime.now().plus(appConfig.getVerifyExpireTime(), ChronoUnit.MINUTES));
        user.setVerify(verify);
        userRepository.save(user);
        // gửi otp qua mail:
        mailService.sendMailVerify(user.getEmail(), user.getFullName(), verifyCode);

        log.warn(user.toString());

        return VerifyResponse.builder()
                .id(user.getId())
                .expiredAt(verify.getExpireAt())
                .build();
    }

    @Override
    public UserResponse verifyUser(String userId, VerifyRequest verifyRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Tài khoản của bạn không tồn tại"));

        // kiểm tra xem có mã xác thực không
        if (user.getVerify() == null) {
            throw new NotFoundException("Mã xác thực không tồn tại");
        }

        // kiểm tra mã xác thực hết hạn chưa
        if (user.getVerify().getExpireAt().isBefore(ZonedDateTime.now())) {
            log.error("Verify code is expired: " + user.getEmail());
            user.setVerify(null); // Xóa mã xác thực đã hết hạn
            userRepository.save(user);
            throw new CustomException("Verify code đã hết hạn!", HttpStatus.UNAUTHORIZED.value());
        }

        // check code
        if (!BCrypt.checkpw(verifyRequest.getCode(), user.getVerify().getCode())) {
            log.error("Verify code is incorrect: " + user.getEmail());
            throw new CustomException("Mã xác thực không chính xác", HttpStatus.UNAUTHORIZED.value());
        }

        // pass, đánh dấu tài khoản là đã được xác thực
        user.setIsEmailVerified(true);
        user.setVerify(null);
        userRepository.save(user);

        return userMapper.convertToDTO(user);
    }


    @Override
    public ResponseEntity<BaseResponse> signin(SigninRequest signinRequest) {
        // xác thực email và password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signinRequest.getEmail(), signinRequest.getPassword())
        );

        // lấy thông tin người dùng từ db
        var user = userRepository.getUserByEmail(signinRequest.getEmail())
                .orElseThrow(()-> new IllegalArgumentException("Invalid email or password!"));

        // kiểm tra tài khoản đã được xác thực chưa
        if (!user.getIsEmailVerified()) {
            throw new CustomException("Tài khoản này chưa được xác thực.", HttpStatus.UNAUTHORIZED.value());
        }

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
