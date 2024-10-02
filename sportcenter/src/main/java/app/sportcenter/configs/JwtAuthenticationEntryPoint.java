package app.sportcenter.configs;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.ErrorCode;

import java.io.IOException;

@Component
// commence được gọi khi có lỗi xác thực, ví dụ như token không hợp lệ,
// token hết hạn, hoặc thông tin đăng nhập không chính xác (401 Unauthorized).
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        String message;
        String errorCode;

        if (authException instanceof BadCredentialsException) {
            // sai thông tin đăng nhập
            message = "Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại email và mật khẩu của bạn.";
            errorCode = ErrorCode.INVALID_CREDENTIALS.name();
        } else {
            // hết hạn token
            message = "Thông tin xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập và thử lại.";
            errorCode = ErrorCode.TOKEN_EXPIRED.name();
        }

        BaseResponse baseResponse = new BaseResponse(message, HttpServletResponse.SC_UNAUTHORIZED, errorCode);
        response.setContentType("application/json;charset=UTF-8");

        // Trả về phản hồi chi tiết với mã lỗi và thông điệp
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(baseResponse.toJson());
    }
}
