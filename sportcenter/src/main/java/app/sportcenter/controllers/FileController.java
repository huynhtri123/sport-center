package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.CloudinaryResponse;
import app.sportcenter.services.CloudinaryService;
import app.sportcenter.utils.FileUploadUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/file")
public class FileController {
    @Autowired
    private CloudinaryService cloudinaryService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PostMapping("/image/upload")
    public ResponseEntity<BaseResponse> uploadImage(@RequestParam(name = "file", required = true)
                                                        MultipartFile file) throws CustomException {
        FileUploadUtil.assertAllowed(file, FileUploadUtil.IMAGE_PATTERN);
        final String fileName = FileUploadUtil.getFileName(file.getOriginalFilename());
        final CloudinaryResponse response = cloudinaryService.uploadFile(file, fileName);

        return ResponseEntity.ok(
                new BaseResponse("Tải ảnh lên Coudinary thành công.", HttpStatus.OK.value(), response)
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @DeleteMapping("/image/delete")
    public ResponseEntity<BaseResponse> deleteImage(@RequestParam("url") String url) throws IOException {
        try {
            cloudinaryService.deleteByUrl(url);
            return ResponseEntity.ok(new BaseResponse("Xóa ảnh thành công.", HttpStatus.OK.value(), null));
        } catch (CustomException e) {
            return ResponseEntity.status(e.getStatusCode()).body(new BaseResponse(e.getMessage(), e.getStatusCode(), null));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new BaseResponse("Lỗi hệ thống. Vui lòng thử lại.", HttpStatus.INTERNAL_SERVER_ERROR.value(), null));
        }
    }

}


