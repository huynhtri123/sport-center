package app.sportcenter.services;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.CloudinaryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface CloudinaryService {
    public CloudinaryResponse uploadFile(MultipartFile file, String fileName) throws CustomException;
    public boolean deleteFileById(String publicId) throws CustomException;
    public void deleteByUrl(String url) throws IOException;
}
