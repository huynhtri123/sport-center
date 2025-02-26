package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.services.TestimonialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/testimonial")
@RequiredArgsConstructor
public class TestimonialController {
    private final TestimonialService testimonialService;

    @GetMapping("all-active")
    public ResponseEntity<BaseResponse> getAllActive() {
        return ResponseEntity.ok(
                new BaseResponse("Get all active testimonials successfully!", 200,
                        testimonialService.getAllActive())
        );
    }
}
