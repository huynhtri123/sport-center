package app.sportcenter.services;


import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.CourseSportType;
import app.sportcenter.models.dto.CourseRequest;
import org.springframework.http.ResponseEntity;

public interface CourseService {
    public ResponseEntity<BaseResponse> create(CourseRequest courseRequest);

    public ResponseEntity<BaseResponse> getAllActive();
    public ResponseEntity<BaseResponse> getById(String fieldId);
    public ResponseEntity<BaseResponse> updateById(String courseId, CourseRequest newCourse);
    public ResponseEntity<BaseResponse> softDelete(String courseId);
    public ResponseEntity<BaseResponse> restore(String courseId);
    public ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(String courseName);




}
