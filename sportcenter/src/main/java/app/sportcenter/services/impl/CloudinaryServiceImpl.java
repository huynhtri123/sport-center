package app.sportcenter.services.impl;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.CloudinaryResponse;
import app.sportcenter.services.CloudinaryService;
import com.cloudinary.Cloudinary;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {
    @Autowired
    private Cloudinary cloudinary;

    @Transactional
    @Override
    public CloudinaryResponse uploadFile(MultipartFile file, String fileName) throws CustomException {
        try {
            //tải tệp lên cloudinary
            final Map result = cloudinary.uploader().upload(
                    file.getBytes(), Map.of("public_id", "sportcenter/" + fileName));

            final String url = (String) result.get("secure_url");
            final String publicId = (String) result.get("public_id");
            return CloudinaryResponse.builder()
                    .publicId(publicId)
                    .url(url)
                    .build();

        } catch (Exception e) {
            throw new CustomException("Failed to upload file, " + e.getMessage(), HttpStatus.BAD_REQUEST.value());
        }
    }

    @Transactional
    @Override
    public boolean deleteFileById(String publicId) throws CustomException {
        try {
            Map result = cloudinary.uploader().destroy(publicId, Map.of());

            // Kiểm tra xem ảnh đã bị xóa thành công chưa
            String resultStatus = (String) result.get("result");
            return "ok".equals(resultStatus);

        } catch (Exception e) {
            throw new CustomException("Failed to delete file, " + e.getMessage(), HttpStatus.BAD_REQUEST.value());
        }
    }

    @Override
    public void deleteByUrl(String url) throws IOException {
        // lấy publicId từ URL
        String[] parts = url.split("/");

        // kiểm tra định dạng URL hợp lệ
        if (parts.length == 0) {
            throw new CustomException("URL không hợp lệ.", HttpStatus.BAD_REQUEST.value());
        }

        // lấy phần tên tệp từ URL
        String fileNameWithExtension = parts[parts.length - 1]; // ví dụ: logo.png_20241020191959.png

        // lấy phần tên tệp mà không có đuôi mở rộng
        String fileNameWithoutExtension = fileNameWithExtension.substring(0, fileNameWithExtension.lastIndexOf('.')); // ví dụ: logo.png_20241020191959

        // xác định public_id
        String publicId = "sportcenter/" + fileNameWithoutExtension; // publicId: sportcenter/logo.png_20241020191959

        log.info("Deleting image with publicId: " + publicId); // Kiểm tra lại publicId ở đây

        // xóa ảnh từ Cloudinary
        try {
            Map<String, Object> result = cloudinary.uploader().destroy(publicId, null);

            // kiểm tra kết quả xóa
            String resultStatus = (String) result.get("result");
            if (!"ok".equals(resultStatus)) {
                throw new CustomException("Không thể xóa ảnh. publicId không tồn tại hoặc đã bị xóa trước đó.", HttpStatus.NOT_FOUND.value());
            }

            log.info("Deleted image with publicId: " + publicId);
        } catch (Exception e) {
            throw new CustomException("Đã xảy ra lỗi khi xóa ảnh: " + e.getMessage(), HttpStatus.BAD_REQUEST.value());
        }
    }

}
