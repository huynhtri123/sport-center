package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.CourseSportType;
import app.sportcenter.models.dto.LessonRequest;
import app.sportcenter.services.LessonService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lesson")
public class LessonController {
    @Autowired
    private LessonService lessonService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody LessonRequest lessonRequest) {
        return lessonService.create(lessonRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/getAllActive")
    public ResponseEntity<BaseResponse> getAllActive() {
        return lessonService.getAllActive();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/getById/{lessonId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable("lessonId") String lessonId) {
        return lessonService.getById(lessonId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/softDelete/{lessonId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable("lessonId") String lessonId) {
        return lessonService.softDelete(lessonId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/restore/{lessonId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable("lessonId") String lessonId) {
        return lessonService.restore(lessonId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/searchByName")
    public ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(
            @RequestParam("lessonName") String lessonName) {
        return lessonService.searchByNameContainingIgnoreCase(lessonName);
    }


    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/findByType")
    public ResponseEntity<BaseResponse> findByCourseSportType(@RequestParam("type") CourseSportType courseSportType) {
        return lessonService.findByCourseSportType(courseSportType);
    }
}
