package app.sportcenter.utils.file;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.services.ExcelService;
import app.sportcenter.services.impl.excel.BannerExcelReader;
import app.sportcenter.services.impl.excel.GalleryExcelReader;
import app.sportcenter.services.impl.excel.TestimonialExcelReader;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

@Component
public class ExcelReaderUtil {

    private final Map<String, ExcelService> strategyMap;

    public ExcelReaderUtil(BannerExcelReader bannerExcelReader,
                           TestimonialExcelReader testimonialExcelReader,
                           GalleryExcelReader galleryExcelReader) {
        this.strategyMap = Map.of(
                "banner", bannerExcelReader,
                "testimonial", testimonialExcelReader,
                "gallery", galleryExcelReader
        );
    }

    public void readExcelFile(MultipartFile file, String type) throws IOException {
        try (InputStream inputStream = file.getInputStream();
             XSSFWorkbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);   // sheet dau tien

            ExcelService strategy = strategyMap.get(type);
            if (strategy != null) {
                strategy.readExcelSheet(sheet);
            } else {
                throw new IllegalArgumentException("Invalid data!");
            }
        } catch (Exception e) {
            throw new CustomException("Invalid file format or mismatched data detected. Please upload the correct file.", 400);
        }
    }

}
