package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.CourseSportType;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.LessonRequest;
import app.sportcenter.models.dto.LessonResponse;
import app.sportcenter.models.entities.Lesson;
import app.sportcenter.repositories.LessonRepository;
import app.sportcenter.services.LessonService;
import app.sportcenter.utils.mappers.LessonMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LessonServiceImpl implements LessonService {
    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private LessonMapper lessonMapper;

    @Override
    public ResponseEntity<BaseResponse> create(LessonRequest lessonRequest) {
        Lesson lesson = lessonMapper.convertToEntity(lessonRequest);
        LessonResponse responseLesson = lessonMapper.convertToDTO(lessonRepository.save(lesson));
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new BaseResponse("Lesson created successfully!", HttpStatus.CREATED.value(), responseLesson)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAllActive() {
        List<Lesson> lessons = lessonRepository.getLessonByIsDeletedFalseAndIsActiveTrue();
        if (lessons.isEmpty()) {
            return ResponseEntity.ok(new BaseResponse("No active lessons found.", HttpStatus.OK.value(), null));
        }
        List<LessonResponse> responseLessons = lessons.stream().map(lessonMapper::convertToDTO).toList();
        return ResponseEntity.ok(new BaseResponse("Active lessons found.", HttpStatus.OK.value(), responseLessons));
    }

    @Override
    public ResponseEntity<BaseResponse> getById(String lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow(
                () -> new NotFoundException("Lesson not found!")
        );
        LessonResponse responseLesson = lessonMapper.convertToDTO(lesson);
        return ResponseEntity.ok(new BaseResponse("Lesson found.", HttpStatus.OK.value(), responseLesson));
    }

    @Override
    public ResponseEntity<BaseResponse> updateById(String lessonId, LessonRequest newLesson) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow(
                () -> new NotFoundException("Lesson not found!")
        );
        Lesson updatedLesson = lessonMapper.replaceAll(lesson, newLesson);
        LessonResponse responseLesson = lessonMapper.convertToDTO(lessonRepository.save(updatedLesson));
        return ResponseEntity.ok(new BaseResponse("Lesson updated successfully.", HttpStatus.OK.value(), responseLesson));
    }

    @Override
    public ResponseEntity<BaseResponse> softDelete(String lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow(
                () -> new NotFoundException("Lesson not found!")
        );
        lesson.setIsDeleted(true);
        LessonResponse responseLesson = lessonMapper.convertToDTO(lessonRepository.save(lesson));
        return ResponseEntity.ok(new BaseResponse("Lesson soft-deleted successfully.", HttpStatus.OK.value(), responseLesson));
    }

    @Override
    public ResponseEntity<BaseResponse> restore(String lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId).orElseThrow(
                () -> new NotFoundException("Lesson not found!")
        );
        lesson.setIsDeleted(false);
        LessonResponse responseLesson = lessonMapper.convertToDTO(lessonRepository.save(lesson));
        return ResponseEntity.ok(new BaseResponse("Lesson restored successfully.", HttpStatus.OK.value(), responseLesson));
    }

    @Override
    public ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(String lessonName) {
        List<Lesson> lessons = lessonRepository.searchByClassNameContainingIgnoreCase(lessonName);
        if (lessons.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("No lessons found with that name.", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        List<LessonResponse> responseLessons = lessons.stream().map(lessonMapper::convertToDTO).toList();
        return ResponseEntity.ok(new BaseResponse("Lessons found.", HttpStatus.OK.value(), responseLessons));
    }

    @Override
    public ResponseEntity<BaseResponse> findByCourseSportType(CourseSportType courseSportType) {
        List<Lesson> lessonList = lessonRepository.findByCourseSportType(courseSportType);

        if (lessonList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy bài học thuộc loại " + courseSportType.name() + ".", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        List<LessonResponse> responseLessons = lessonList.stream().map(lessonMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách sân thuộc loại " + courseSportType.name() + ".", HttpStatus.OK.value(), responseLessons)
        );
    }
}
