package app.sportcenter.utils.file;

import app.sportcenter.exceptions.CustomException;
import lombok.experimental.UtilityClass;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@UtilityClass
public class FileUploadUtil {
    public static final long MAX_IMAGE_SIZE = 2 * 1024 * 1024;   // 2MB
    public static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB
    public static final String IMAGE_PATTERN = "([^\\s]+(\\.(?i)(jpg|png|jpeg|gif|bmp))$)";
    public static final String VIDEO_PATTERN = "([^\\s]+(\\.(?i)(mp4|mkv|avi))$)";
    public static final String DATE_FORMAT = "yyyyMMddHHmmss";
    public static final String FILE_NAME_FORMAT = "%s_%s";

    // Kiểm tra phần mở rộng của file
    public static boolean isAllowedExtension(final String fileName, final String pattern) {
        final Matcher matcher = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE).matcher(fileName);
        return matcher.matches();
    }

    // Xử lý kiểm tra file hình ảnh
    public static void assertAllowedImage(MultipartFile file) throws CustomException {
        final long size = file.getSize();
        if (size > MAX_IMAGE_SIZE) {
            throw new CustomException("Max image file size is 2MB", HttpStatus.BAD_REQUEST.value());
        }
        final String fileName = file.getOriginalFilename();
        assert fileName != null;
        if (!isAllowedExtension(fileName, IMAGE_PATTERN)) {
            throw new CustomException("Only jpg, png, jpeg, gif, bmp files are allowed", HttpStatus.BAD_REQUEST.value());
        }
    }

    // Xử lý kiểm tra file video
    public static void assertAllowedVideo(MultipartFile file) throws CustomException {
        final long size = file.getSize();
        if (size > MAX_VIDEO_SIZE) {
            throw new CustomException("Max video file size is 50MB", HttpStatus.BAD_REQUEST.value());
        }
        final String fileName = file.getOriginalFilename();
        assert fileName != null;
        if (!isAllowedExtension(fileName, VIDEO_PATTERN)) {
            throw new CustomException("Only mp4, mkv, avi files are allowed", HttpStatus.BAD_REQUEST.value());
        }
    }

    // Sinh tên file
    public static String getFileName(final String name) {
        final DateFormat dateFormat = new SimpleDateFormat(DATE_FORMAT);
        final String date = dateFormat.format(System.currentTimeMillis());
        return String.format(FILE_NAME_FORMAT, name, date);
    }
}
