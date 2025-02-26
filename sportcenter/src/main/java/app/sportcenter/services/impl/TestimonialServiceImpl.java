package app.sportcenter.services.impl;

import app.sportcenter.models.dto.response.TestimonialResponse;
import app.sportcenter.repositories.TestimonialRepository;
import app.sportcenter.services.TestimonialService;
import app.sportcenter.utils.mappers.TestimonialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TestimonialServiceImpl implements TestimonialService {

    private final MongoTemplate mongoTemplate;
    private final TestimonialRepository testimonialRepository;
    private final TestimonialMapper testimonialMapper;

    @Override
    public void deactiveAll() {
        Query query = new Query();
        Update update = new Update().set("isActive", false);

        mongoTemplate.updateMulti(query, update, "testimonials");
    }

    @Override
    public List<TestimonialResponse> getAllActive() {
        return testimonialRepository.getByIsActiveTrueAndIsDeletedFalse()
                .stream().map(testimonialMapper::convertToRespone).toList();
    }
}
