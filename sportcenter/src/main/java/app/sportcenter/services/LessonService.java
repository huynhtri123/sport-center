package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.CourseSportType;
import app.sportcenter.models.dto.LessonRequest;
import org.springframework.http.ResponseEntity;

public interface LessonService {
    ResponseEntity<BaseResponse> create(LessonRequest lessonRequest);
    ResponseEntity<BaseResponse> getAllActive();
    ResponseEntity<BaseResponse> getById(String lessonId);
    ResponseEntity<BaseResponse> updateById(String lessonId, LessonRequest newLesson);
    ResponseEntity<BaseResponse> softDelete(String lessonId);
    ResponseEntity<BaseResponse> restore(String lessonId);
    ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(String lessonName);

    public ResponseEntity<BaseResponse> findByCourseSportType(CourseSportType courseSportType);

}
