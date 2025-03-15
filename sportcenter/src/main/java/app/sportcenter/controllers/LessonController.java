package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.request.LessonRequest;
import app.sportcenter.services.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lesson")
@RequiredArgsConstructor
public class LessonController {
    private final LessonService lessonService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody LessonRequest lessonRequest) {
        return lessonService.create(lessonRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/all-active")
    public ResponseEntity<BaseResponse> getAllActive() {
        return lessonService.getAllActive();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/{lessonId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable("lessonId") String lessonId) {
        return lessonService.getById(lessonId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/soft-delete/{lessonId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable("lessonId") String lessonId) {
        return lessonService.softDelete(lessonId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/restore/{lessonId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable("lessonId") String lessonId) {
        return lessonService.restore(lessonId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/search-by-name")
    public ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(
            @RequestParam("lessonName") String lessonName) {
        return lessonService.searchByNameContainingIgnoreCase(lessonName);
    }

}
