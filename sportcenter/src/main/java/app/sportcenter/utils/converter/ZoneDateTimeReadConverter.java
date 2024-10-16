package app.sportcenter.utils.converter;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;

@ReadingConverter
public class ZoneDateTimeReadConverter implements Converter<Date, ZonedDateTime> {

    @Override
    public ZonedDateTime convert(Date date) {
        return date.toInstant().atZone(ZoneId.systemDefault());
    }
}
