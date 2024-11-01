package app.sportcenter.controllers;


import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.CourseSportType;
import app.sportcenter.models.dto.CourseRequest;
import app.sportcenter.services.CourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/course")
public class CourseController {
    @Autowired
    private CourseService courseService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody CourseRequest courseRequest) {
        return courseService.create(courseRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/getAllActive")
    public ResponseEntity<BaseResponse> getAllActive() {
        return courseService.getAllActive();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/getById/{courseId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable("courseId") String courseId) {
        return courseService.getById(courseId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/softDelete/{courseId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable("courseId") String courseId) {
        return courseService.softDelete(courseId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/restore/{courseId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable("courseId") String courseId) {
        return courseService.restore(courseId);
    }


    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/searchByName")
    public ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(
            @RequestParam("courseName") String courseName) {
        return courseService.searchByNameContainingIgnoreCase(courseName);
    }
}
