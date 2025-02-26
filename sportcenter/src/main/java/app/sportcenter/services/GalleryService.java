package app.sportcenter.services;

import app.sportcenter.models.dto.response.GalleryResponse;

import java.util.List;

public interface GalleryService {

    public void deactiveAll();

    public List<GalleryResponse> getAllActive();

}
