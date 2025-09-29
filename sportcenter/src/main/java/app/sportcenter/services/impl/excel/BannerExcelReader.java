package app.sportcenter.services.impl.excel;

import app.sportcenter.models.entities.Banner;
import app.sportcenter.repositories.BannerRepository;
import app.sportcenter.services.BannerService;
import app.sportcenter.services.ExcelService;
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
public class BannerExcelReader implements ExcelService {

    private final BannerRepository bannerRepository;
    private final BannerService bannerService;

    @Transactional
    @Override
    public void readExcelSheet(Sheet sheet) throws IOException {
        boolean isHeader = true;
        String batchId = UUID.randomUUID().toString();
        List<Banner> bannersToSave = new ArrayList<>();

        // deactive het nhung cai khac de dung cai hien tai
        bannerService.deactiveAll();

        for (Row row : sheet) {
            // bo qua header
            if (isHeader) {
                isHeader = false;
                continue;
            }

            Banner banner = new Banner();
            banner.setOrder(row.getCell(0).getNumericCellValue());
            banner.setUrl(row.getCell(1).getStringCellValue());
            banner.setBatchId(batchId);
            banner.setIsActive(true);
            bannersToSave.add(banner);
        }
        bannerRepository.saveAll(bannersToSave);
    }
}
