package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.request.LessonRequest;
import org.springframework.http.ResponseEntity;

public interface
LessonService {
    ResponseEntity<BaseResponse> create(LessonRequest lessonRequest);

    ResponseEntity<BaseResponse> getAllActive();

    ResponseEntity<BaseResponse> getById(String lessonId);

    ResponseEntity<BaseResponse> updateById(String lessonId, LessonRequest newLesson);

    ResponseEntity<BaseResponse> softDelete(String lessonId);

    ResponseEntity<BaseResponse> restore(String lessonId);

    ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(String lessonName);

}
