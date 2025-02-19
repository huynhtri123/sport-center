package app.sportcenter.exceptions.handler;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.ErrorCode;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import io.jsonwebtoken.JwtException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

import javax.naming.AuthenticationException;
import org.springframework.security.access.AccessDeniedException;
import java.util.HashMap;
import java.util.Map;

@RestController
@ControllerAdvice
@Slf4j
public class RestExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<BaseResponse>handleIllegalArgumentException(IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new BaseResponse(exception.getMessage(), HttpStatus.BAD_REQUEST.value(), null)
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BaseResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        // Tạo Map để lưu các lỗi theo định dạng field -> message
        Map<String, String> errors = new HashMap<>();
        String specificErrorMessage = ""; // Biến để lưu thông báo lỗi cụ thể

        // Lặp qua các lỗi của BindingResult
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            String fieldName = fieldError.getField(); // Lấy tên trường lỗi
            String errorMessage = fieldError.getDefaultMessage(); // Lấy thông báo lỗi mặc định

            // Kiểm tra nếu lỗi liên quan đến @Future (Ngày phải trong tương lai)
            if (fieldError.getCode() != null && fieldError.getCode().contains("Future")) {
                // Nếu là lỗi về ngày không phải trong tương lai, tạo thông báo chi tiết cho lỗi này
                errorMessage = "Field '" + fieldName + "' must be a date in the future.";
                specificErrorMessage = "The start date must be a date in the future."; // Thông báo lỗi cụ thể cho trường hợp này
            }

            // Thêm lỗi vào Map (field -> message)
            errors.put(fieldName, errorMessage);
        }

        // Nếu có lỗi specific (lỗi Future), gán message là thông báo lỗi cụ thể
        if (!specificErrorMessage.isEmpty()) {
            // Nếu có lỗi về ngày trong tương lai, gán message cụ thể vào response
            BaseResponse response = new BaseResponse();
            response.setMessage(specificErrorMessage); // Lỗi cụ thể cho ngày
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            response.setData(errors); // Gán lỗi vào data
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Trường hợp còn lại, lỗi không phải Future
        BaseResponse response = new BaseResponse();
        response.setMessage("Invalid input");
        response.setStatus(HttpStatus.BAD_REQUEST.value());
        response.setData(errors); // Gán lỗi vào data

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse> handleException(Exception e){
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR.value()).body(
                new BaseResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), null)
        );
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<BaseResponse> handleNotFoundException(NotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new BaseResponse(exception.getMessage(), HttpStatus.NOT_FOUND.value(), null)
        );
    }

    @ExceptionHandler({ AuthenticationException.class, JwtException.class })
    public ResponseEntity<BaseResponse> handleAuthenticationException(AuthenticationException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new BaseResponse("Thông tin xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập và thử lại.",
                        HttpStatus.UNAUTHORIZED.value(), ErrorCode.TOKEN_EXPIRED.name())
        );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<BaseResponse> handleBadCredentialsException(BadCredentialsException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new BaseResponse(exception.getMessage(),
                        HttpStatus.UNAUTHORIZED.value(), ErrorCode.INVALID_CREDENTIALS.name())
        );
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<BaseResponse> handleCustomException(CustomException e) {
        log.warn("Custom Exception: {}", e.getMessage());
        BaseResponse response = new BaseResponse();
        response.setStatus(e.getStatusCode());
        response.setMessage(e.getMessage());
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<BaseResponse> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new BaseResponse(ex.getMessage(),
                        HttpStatus.FORBIDDEN.value(), null));
    }

}
