package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.utils.kafkaUsage.MessageWrapper;
import app.sportcenter.commons.Role;
import app.sportcenter.commons.SendMailType;
import app.sportcenter.configs.AppConfig;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.*;
import app.sportcenter.models.entities.BackListToken;
import app.sportcenter.models.entities.User;
import app.sportcenter.models.entities.Verify;
import app.sportcenter.repositories.BackListTokenRepository;
import app.sportcenter.repositories.UserRepository;
import app.sportcenter.services.AuthenticationService;
import app.sportcenter.services.JWTService;
import app.sportcenter.services.MailService;
import app.sportcenter.services.UserService;
import app.sportcenter.utils.mappers.UserMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Optional;
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
    private final BackListTokenRepository backListTokenRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void autoCreateAdminAccount() {
        if (!userRepository.existsByRole(Role.ADMIN)) {
            User admin = new User();
            admin.setFullName("ADMIN");
            admin.setIsEmailVerified(true);
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

    // Đăng ký bước 1
    @Transactional(rollbackFor = Exception.class)
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

        // gửi otp qua mail:
        try {
            MessageWrapper messageWrapper = MessageWrapper.builder()
                    .type(SendMailType.OTP_VERIFY.name())
                    .payload(verifyCode)
                    .toEmail((user.getEmail()))
                    .toFullName(user.getFullName())
                    .build();
            kafkaTemplate.send("notification-delivery", messageWrapper);

        } catch (Exception e) {
            log.error("Lỗi khi gửi email xác thực cho người dùng: " + user.getEmail(), e);
            throw new RuntimeException("Lỗi khi gửi email xác thực. Vui lòng thử lại sau.", e);
        }

        user.setVerify(verify);
        userRepository.save(user);

        log.info("Create new User succesfully! UserId: " + user.getId());

        return VerifyResponse.builder()
                .id(user.getId())
                .expiredAt(verify.getExpireAt())
                .build();
    }

    // Đăng ký bước 2 (Kiểm tra OTP)
    @Override
    public UserResponse verifyUser(String userId, VerifyRequest verifyRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Tài khoản của bạn không tồn tại"));

        // kiểm tra xem có mã xác thực không
        if (user.getVerify() == null) {
            throw new NotFoundException("Mã xác thực không tồn tại");
        }

        // kiểm tra xem tài khoản đã đươc xác thực trước đó chưa
        if (user.getIsEmailVerified()) {
            throw new CustomException("Tài khoản này đã được xác thực trước đó rồi.", HttpStatus.BAD_REQUEST.value());
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

        log.info("Verify User succesfully! UserId: " + user.getId());

        return userMapper.convertToDTO(user);
    }


    @Override
    public ResponseEntity<BaseResponse> signin(SigninRequest signinRequest, HttpServletResponse response) {
        try {
            // xác thực email và password
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(signinRequest.getEmail(), signinRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Thông tin đăng nhập không chính xác.");
        } catch (IllegalArgumentException e) {
            throw new CustomException("Invalid email or password!", HttpStatus.UNAUTHORIZED.value());
        } catch (Exception e) {
            log.error("Error during authentication: " + e.getMessage(), e);
            throw new CustomException("Lỗi không xác định xảy ra. Vui lòng thử lại.", HttpStatus.INTERNAL_SERVER_ERROR.value());
        }

        // lấy thông tin người dùng từ db
        var user = userRepository.getUserByEmail(signinRequest.getEmail())
                .orElseThrow(()-> new IllegalArgumentException("Invalid email or password!"));

        // kiểm tra tài khoản đã được xác thực chưa
        if (!user.getIsEmailVerified()) {
            throw new BadCredentialsException("Tài khoản này chưa được xác thực. Vui lòng chọn chức năng Quên mật khẩu để xác thực.");
        }

        var accessToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(new HashMap<>(), user);

        JWTAuthResponse jwtAuthResponse = new JWTAuthResponse();
        jwtAuthResponse.setEmail(user.getEmail());
        jwtAuthResponse.setRole(user.getRole().name());
        jwtAuthResponse.setTokenType("Bearer");
        jwtAuthResponse.setToken(accessToken);
        jwtAuthResponse.setRefreshToken(refreshToken);

        // lưu accessToken vào cookie
        Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(true);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(60 * 30); // 30p (60 * 30)

        // Lưu refreshToken vào cookie
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(60 * 60 * 24 * 7); // 7 ngày (60 * 60 * 24 * 7)

        // Thêm cookies vào response
        response.addCookie(accessTokenCookie);
        response.addCookie(refreshTokenCookie);

        // Thêm thuộc tính SameSite vào cookies
        addSameSiteAttribute(response, accessTokenCookie, "None");
        addSameSiteAttribute(response, refreshTokenCookie, "None");

        log.info("Login successfully! UserId: " + user.getId() + " Role: " + user.getRole());

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Đăng nhập thành công",
                        HttpStatus.OK.value(),
                        jwtAuthResponse)
        );
    }

    // Hàm thêm thuộc tính SameSite vào cookie
    private void addSameSiteAttribute(HttpServletResponse response, Cookie cookie, String sameSite) {
        String cookieValue = String.format("%s=%s; HttpOnly; Secure; Path=%s; Max-Age=%d; SameSite=%s",
                cookie.getName(),
                cookie.getValue(),
                cookie.getPath(),
                cookie.getMaxAge(),
                sameSite
        );
        response.addHeader("Set-Cookie", cookieValue);
    }

    @Override
    public ResponseEntity<BaseResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        // lấy refreshToken từ cookie
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }
        //log.error("check refreshTokenCookie: " + refreshToken);

        if (refreshToken == null) {
            // Refresh token not found
            throw new CustomException("Thông tin xác thực không hợp lệ, vui lòng đăng nhập lại!", HttpStatus.BAD_REQUEST.value());
        }

        // Kiểm tra xem refreshToken có bị revoked (ở trong blacklist) không
        Optional<BackListToken> backListTokenOpt = backListTokenRepository.getBackListTokenByToken(refreshToken);
        if (backListTokenOpt.isPresent() && backListTokenOpt.get().isRevoked()) {
            // Nếu refreshToken đã bị revoked (trong blacklist)
            throw new CustomException("Refresh token has been revoked", HttpStatus.BAD_REQUEST.value());
        }

        String userEmail = jwtService.extractUserName(refreshToken);
        User user = userRepository.getUserByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (jwtService.isValidToken(refreshToken, user)){
            var jwt = jwtService.generateToken(user);

            JWTAuthResponse jwtAuthResponse = new JWTAuthResponse();
            jwtAuthResponse.setEmail(user.getEmail());
            jwtAuthResponse.setTokenType("Bearer");
            jwtAuthResponse.setToken(jwt);
            jwtAuthResponse.setRefreshToken(refreshToken);

            // Lưu accessToken vào cookie
            Cookie accessTokenCookie = new Cookie("accessToken", jwtAuthResponse.getToken());
            accessTokenCookie.setHttpOnly(true);
            accessTokenCookie.setSecure(true);
            accessTokenCookie.setPath("/");
            accessTokenCookie.setMaxAge(60 * 30); // 30p
            // Thêm cookies vào response
            response.addCookie(accessTokenCookie);

            // Thêm thuộc tính SameSite vào cookies
            addSameSiteAttribute(response, accessTokenCookie, "None");

            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Refresh token successfully", HttpStatus.OK.value(), jwtAuthResponse)
            );
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                // invalid refreshToken (refreshToken het han thi nem ra)
                new BaseResponse("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại", HttpStatus.BAD_REQUEST.value(), null)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    @Override
    public ResponseEntity<BaseResponse> sendVerifyRequest(ForgotPasswordRequest forgotPasswordRequest) {
        User user = userService.getUserByEmail(forgotPasswordRequest.getEmail());
        if (user == null) {
            throw new CustomException("Không tìm thấy người dùng có email này!", HttpStatus.NOT_FOUND.value());
        }

        // kiểm tra xem user này được xác thực chưa
        boolean isVerified = user.getIsEmailVerified();
        String message = "";
        // nếu được xác thực rồi thì đây là yêu cầu lấy lại mật khẩu
        if (isVerified) {
            message = "Mã khôi phục mật khẩu đã được gửi đến email:" + user.getEmail();
        } else {
            message = "Mã xác thực đã được gửi đến email:" + user.getEmail();
        }

        // gửi OTP
        String verifyCode = getVerifyCode();
        Verify verify = new Verify(BCrypt.hashpw(verifyCode, BCrypt.gensalt(appConfig.getLogRounds())),
                ZonedDateTime.now().plus(appConfig.getVerifyExpireTime(), ChronoUnit.MINUTES));

        // gửi otp qua mail:
        try {
            MessageWrapper messageWrapper = MessageWrapper.builder()
                    .type(SendMailType.OTP_VERIFY.name())
                    .payload(verifyCode)
                    .toEmail((user.getEmail()))
                    .toFullName(user.getFullName())
                    .build();
            kafkaTemplate.send("notification-delivery", messageWrapper);

        } catch (Exception e) {
            log.error("Lỗi khi gửi email xác thực cho người dùng: " + user.getEmail(), e);
            throw new RuntimeException("Lỗi khi gửi email xác thực. Vui lòng thử lại sau.", e);
        }

        user.setVerify(verify);
        userRepository.save(user);

        VerifyResponse verifyResponse = VerifyResponse.builder()
                .id(user.getId())
                .expiredAt(verify.getExpireAt())
                .build();

        log.info("Send verify request succesfully! UserId: " + user.getId());

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse(message, HttpStatus.OK.value(), verifyResponse)
        );
    }

    @Override
    public UserResponse renewPassword(String userId, RenewPasswordRequest renewPasswordRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng này"));

        // kiểm tra xem có mã xác thực không
        if (user.getVerify() == null) {
            throw new NotFoundException("Mã xác thực không tồn tại");
        }

        // kiểm tra xem tài khoản này đã được xác thực chưa (không cần thiết)
//        if (!user.getIsEmailVerified()) {
//            throw new CustomException("Tài khoản này chưa được xác thực. Vui lòng xác thực bằng cách gọi api đăng ký bước 2",
//                    HttpStatus.BAD_REQUEST.value());
//        }

        // kiểm tra mã xác thực hết hạn chưa
        if (user.getVerify().getExpireAt().isBefore(ZonedDateTime.now())) {
            log.error("Verify code is expired: " + user.getEmail());
            user.setVerify(null); // Xóa mã xác thực đã hết hạn
            userRepository.save(user);
            throw new CustomException("Verify code đã hết hạn!", HttpStatus.UNAUTHORIZED.value());
        }

        // check mã khôi phục
        if (!BCrypt.checkpw(renewPasswordRequest.getResetPasswordCode(), user.getVerify().getCode())) {
            log.error("Verify code is incorrect: " + user.getEmail());
            throw new CustomException("Mã xác thực không chính xác", HttpStatus.UNAUTHORIZED.value());
        }

        // check mật khẩu và xác nhận mật khẩu
        if (!checkMatchPassword(renewPasswordRequest.getPassword(), renewPasswordRequest.getComfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu và xác nhận mật khẩu không khớp");
        }

        // pass, tạo mật khẩu mới
        user.setPassword(passwordEncoder.encode(renewPasswordRequest.getPassword()));
        user.setVerify(null);
        user.setIsEmailVerified(true);
        userRepository.save(user);

        log.info("Change password succesfully! UserId: " + user.getId());

        return userMapper.convertToDTO(user);
    }

    @Override
    public void signout(HttpServletRequest request, HttpServletResponse response) {
        // lấy refreshToken từ cookie
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        // Nếu refreshToken tồn tại, lưu vào blacklist
        // cải tiến sau này: check refreshToken hết hạn thì xoá ra khỏi db
        if (refreshToken != null) {
            BackListToken backListToken = new BackListToken();
            backListToken.setToken(refreshToken);
            backListToken.setRevoked(true);
            backListTokenRepository.save(backListToken);
        }

        // Xóa refreshToken cookie
        Cookie refreshTokenCookie = new Cookie("refreshToken", null);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true); // Chỉ dùng khi HTTPS
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0); // Xóa cookie

        // Xóa accessToken cookie
        Cookie accessTokenCookie = new Cookie("accessToken", null);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(true); // Chỉ dùng khi HTTPS
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(0); // Xóa cookie

        // Đính cookie đã xóa vào response
        response.addCookie(refreshTokenCookie);
        response.addCookie(accessTokenCookie);

        // Thêm thuộc tính SameSite vào cookies
        addSameSiteAttribute(response, accessTokenCookie, "None");
        addSameSiteAttribute(response, refreshTokenCookie, "None");
    }

}
