package app.sportcenter.services;

import org.apache.poi.ss.usermodel.Sheet;

import java.io.IOException;

public interface ExcelService {

    public void readExcelSheet(Sheet sheet) throws IOException;

}
