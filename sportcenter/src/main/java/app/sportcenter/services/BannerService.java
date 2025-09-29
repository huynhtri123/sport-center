package app.sportcenter.services;

import app.sportcenter.models.dto.response.BannerResponse;

import java.util.List;

public interface BannerService {

    public void deactiveAll();

    public List<BannerResponse> getAllActive();

}
