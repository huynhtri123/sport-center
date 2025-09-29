package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.services.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/gallery")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    @GetMapping("all-active")
    public ResponseEntity<BaseResponse> getAllActive() {
        return ResponseEntity.ok(
                new BaseResponse("Get all active banners successfully!", 200,
                        galleryService.getAllActive())
        );
    }
}
