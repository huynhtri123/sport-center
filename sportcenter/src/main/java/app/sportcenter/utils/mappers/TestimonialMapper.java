package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.response.TestimonialResponse;
import app.sportcenter.models.entities.Testimonial;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TestimonialMapper {
    private final ModelMapper modelMapper;

    public TestimonialResponse convertToRespone(Testimonial testimonial) {
        return modelMapper.map(testimonial, TestimonialResponse.class);
    }
}
