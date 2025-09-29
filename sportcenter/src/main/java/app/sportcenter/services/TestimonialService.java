package app.sportcenter.services;

import app.sportcenter.models.dto.response.TestimonialResponse;

import java.util.List;

public interface TestimonialService {

    public void deactiveAll();

    public List<TestimonialResponse> getAllActive();

}
