package app.sportcenter.repositories;

import app.sportcenter.commons.CourseSportType;
import app.sportcenter.commons.FieldType;
import app.sportcenter.models.entities.Course;
import app.sportcenter.models.entities.Field;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface CourseRepository extends MongoRepository<Course, String> {
    // Lấy tất cả field đã bị xoá mềm
    public List<Course> getCourseByIsDeletedTrue();

    // Lấy tất cả field đang còn hoạt động (chưa bị xoá và trạng thái active)
    public List<Course> getCourseByIsDeletedFalseAndIsActiveTrue();


    @Query("{ 'courseName': { $regex: ?0, $options: 'i' }, 'isDeleted': false, 'isActive': true }")
    public List<Course> searchByClassNameContainingIgnoreCase(String courseName);
}
