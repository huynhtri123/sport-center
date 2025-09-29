package app.sportcenter.services.impl;

import app.sportcenter.models.dto.response.GalleryResponse;
import app.sportcenter.repositories.GalleryRepository;
import app.sportcenter.services.GalleryService;
import app.sportcenter.utils.mappers.GalleryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GalleryServiceImpl implements GalleryService {

    private final MongoTemplate mongoTemplate;
    private final GalleryRepository galleryRepository;
    private final GalleryMapper galleryMapper;

    @Override
    public void deactiveAll() {
        Query query = new Query();
        Update update = new Update().set("isActive", false);

        mongoTemplate.updateMulti(query, update, "galleries");
    }

    @Override
    public List<GalleryResponse> getAllActive() {
        return galleryRepository.getByIsActiveTrueAndIsDeletedFalse()
                .stream().map(galleryMapper::convertToResponse).toList();
    }
}
