package app.sportcenter.services.impl.excel;

import app.sportcenter.models.entities.Testimonial;
import app.sportcenter.repositories.TestimonialRepository;
import app.sportcenter.services.ExcelService;
import app.sportcenter.services.TestimonialService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestimonialExcelReader implements ExcelService {

    private final TestimonialRepository testimonialRepository;
    private final TestimonialService testimonialService;

    @Transactional
    @Override
    public void readExcelSheet(Sheet sheet) throws IOException {
        boolean isHeader = true;
        String batchId = UUID.randomUUID().toString();
        List<Testimonial> testimonialsToSave = new ArrayList<>();

        // deactive het nhung cai khac de dung cai hien tai
        testimonialService.deactiveAll();

        for (Row row : sheet) {
            if (isHeader) {
                isHeader = false;
                continue;
            }
            Testimonial testimonial = new Testimonial();
            testimonial.setOrder(row.getCell(0).getNumericCellValue());
            testimonial.setComment(row.getCell(1).getStringCellValue());
            testimonial.setAuthor(row.getCell(2).getStringCellValue());
            testimonial.setBatchId(batchId);
            testimonial.setIsActive(true);
            testimonialsToSave.add(testimonial);
        }
        testimonialRepository.saveAll(testimonialsToSave);
    }
}
