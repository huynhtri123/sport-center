package app.sportcenter.repositories;

import app.sportcenter.commons.CourseSportType;
import app.sportcenter.models.entities.Lesson;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends MongoRepository<Lesson, String> {
    public List<Lesson> getLessonByIsDeletedTrue();

    // Lấy tất cả field đang còn hoạt động (chưa bị xoá và trạng thái active)
    public List<Lesson> getLessonByIsDeletedFalseAndIsActiveTrue();


    @Query("{ 'lessonName': { $regex: ?0, $options: 'i' }, 'isDeleted': false, 'isActive': true }")
    public List<Lesson> searchByClassNameContainingIgnoreCase(String lessonName);

    @Query("{ 'courseSportType': ?0, 'isDeleted': false, 'isActive': true }")
    List<Lesson> findByCourseSportType(CourseSportType courseSportType);
}
