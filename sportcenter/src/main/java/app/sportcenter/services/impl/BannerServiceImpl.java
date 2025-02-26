package app.sportcenter.services.impl;

import app.sportcenter.models.dto.response.BannerResponse;
import app.sportcenter.repositories.BannerRepository;
import app.sportcenter.services.BannerService;
import app.sportcenter.utils.mappers.BannerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final MongoTemplate mongoTemplate;
    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;

    @Override
    public void deactiveAll() {
        Query query = new Query();
        Update update = new Update().set("isActive", false);

        mongoTemplate.updateMulti(query, update, "banners");
    }

    @Override
    public List<BannerResponse> getAllActive() {
        return bannerRepository.getByIsActiveTrueAndIsDeletedFalse()
                .stream().map(bannerMapper::convertToResponse).toList();
    }
}
