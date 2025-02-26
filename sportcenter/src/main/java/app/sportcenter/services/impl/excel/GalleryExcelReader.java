package app.sportcenter.services.impl.excel;

import app.sportcenter.models.entities.Banner;
import app.sportcenter.models.entities.Gallery;
import app.sportcenter.repositories.BannerRepository;
import app.sportcenter.repositories.GalleryRepository;
import app.sportcenter.services.BannerService;
import app.sportcenter.services.ExcelService;
import app.sportcenter.services.GalleryService;
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
public class GalleryExcelReader implements ExcelService {
    private final GalleryRepository galleryRepository;
    private final GalleryService galleryService;


    @Transactional
    @Override
    public void readExcelSheet(Sheet sheet) throws IOException {
        boolean isHeader = true;
        String batchId = UUID.randomUUID().toString();
        List<Gallery> galleriesToSave = new ArrayList<>();

        // deactive het nhung cai khac de dung cai hien tai
        galleryService.deactiveAll();

        for (Row row : sheet) {
            // bo qua header
            if (isHeader) {
                isHeader = false;
                continue;
            }

            Gallery gallery = new Gallery();
            gallery.setOrder(row.getCell(0).getNumericCellValue());
            gallery.setUrl(row.getCell(1).getStringCellValue());
            gallery.setBatchId(batchId);
            gallery.setIsActive(true);
            galleriesToSave.add(gallery);
        }
        galleryRepository.saveAll(galleriesToSave);
    }
}
