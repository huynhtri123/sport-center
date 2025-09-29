package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.utils.file.ExcelReaderUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/excel")
@RequiredArgsConstructor
public class ExcelController {

    private final ExcelReaderUtil excelReaderUtil;

    @PreAuthorize("hasAnyAuthority('CUSTOMER', 'ADMIN')")
    @PostMapping("/upload")
    public ResponseEntity<BaseResponse> uploadExcelFile(@RequestParam("file") MultipartFile file,
                                                        @RequestParam("type") String type) {
        try {
            excelReaderUtil.readExcelFile(file, type);
            return ResponseEntity.ok(
                    new BaseResponse("Upload excel file successfully!", 200, null)
            );
        } catch (IOException e) {
            throw new CustomException("Upload excel file failed! " + e.getMessage(), 400);
        }
    }
}
