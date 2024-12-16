package app.sportcenter.repositories;

import app.sportcenter.commons.CourseSportType;
import app.sportcenter.commons.FieldType;
import app.sportcenter.models.entities.Course;
import app.sportcenter.models.entities.Field;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
@Repository
public interface CourseRepository extends MongoRepository<Course, String> {
    // Lấy tất cả field đã bị xoá mềm
    public List<Course> getCourseByIsDeletedTrue();

    // Lấy tất cả field đang còn hoạt động (chưa bị xoá và trạng thái active)
    public List<Course> getCourseByIsDeletedFalseAndIsActiveTrue();


    @Query("{ 'courseName': { $regex: ?0, $options: 'i' }, 'isDeleted': false, 'isActive': true }")
    public List<Course> searchByClassNameContainingIgnoreCase(String courseName);

    Page<Course> findByIsDeletedFalseAndIsActiveTrue(Pageable pageable);

    @Query("{ 'courseName': { $regex: ?0, $options: 'i' }, 'isDeleted': false, 'isActive': true }")
    Page<Course> searchByClassNameContainingIgnoreCase(String courseName, Pageable pageable);

    @Query("{ 'isDeleted': false, 'isActive': true }")
    Page<Course> findAllActive(Pageable pageable);

    @Query("{ 'courseName': { $regex: ?0, $options: 'i' }, 'isDeleted': false, 'isActive': true }")
    Page<Course> searchByNameContainingIgnoreCase(String courseName, Pageable pageable);
}
