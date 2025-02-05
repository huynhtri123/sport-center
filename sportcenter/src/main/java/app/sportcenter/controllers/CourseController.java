package app.sportcenter.controllers;


import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.CourseRequest;
import app.sportcenter.services.CourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CourseController {
    @Autowired
    private CourseService courseService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/course/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody CourseRequest courseRequest) {
        return courseService.create(courseRequest);
    }

    @GetMapping("/public/course/all-active")
    public ResponseEntity<BaseResponse> getAllActive(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return courseService.getAllActive(page, size);
    }

    @GetMapping("/public/course/{courseId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable("courseId") String courseId) {
        return courseService.getById(courseId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/course/soft-delete/{courseId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable("courseId") String courseId) {
        return courseService.softDelete(courseId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/course/restore/{courseId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable("courseId") String courseId) {
        return courseService.restore(courseId);
    }


    @GetMapping("/public/course/search-by-name")
    public ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(
            @RequestParam("courseName") String courseName) {
        return courseService.searchByNameContainingIgnoreCase(courseName);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/course/update/{courseId}")
    public ResponseEntity<BaseResponse> updateById(@PathVariable(value = "courseId") String courseId,
                                                   @Valid @RequestBody CourseRequest courseRequest) {
        return courseService.updateById(courseId, courseRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/course/{courseId}/lessons/{lessonId}")
    public ResponseEntity<BaseResponse> deleteLesson(@PathVariable String courseId, @PathVariable String lessonId) {
        return courseService.deleteLessonFromCourse(courseId, lessonId);
    }

    @GetMapping("/public/course/search-by-name-page")
    public ResponseEntity<BaseResponse> searchByNameAndPaginate(
            @RequestParam("courseName") String courseName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return courseService.searchByNameAndPaginate(courseName, page, size);
    }

}
