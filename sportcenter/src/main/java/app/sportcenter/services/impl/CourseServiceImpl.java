package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.CourseSportType;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.CourseRequest;
import app.sportcenter.models.dto.CourseResponse;
import app.sportcenter.models.entities.Course;
import app.sportcenter.repositories.CourseRepository;
import app.sportcenter.services.CourseService;
import app.sportcenter.utils.mappers.CourseMapper;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseServiceImpl implements CourseService {
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private CourseMapper courseMapper;
    @Autowired
    private ModelMapper modelMapper;

    @Override
    public ResponseEntity<BaseResponse> create(CourseRequest courseRequest) {
        Course course = courseMapper.convertToEntity(courseRequest);
        if (course == null) {
            throw new CustomException("Inputs are null!", HttpStatus.BAD_REQUEST.value());
        }
        CourseResponse responseCourse = courseMapper.convertToDTO(courseRepository.save(course));
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(
                new BaseResponse("Tạo mới khóa học (course) thành công!", HttpStatus.CREATED.value(), responseCourse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAllActive() {
        List<Course> courseList = courseRepository.getCourseByIsDeletedFalseAndIsActiveTrue();
        if (courseList.isEmpty()) {
            return ResponseEntity.ok(
                    new BaseResponse("No active courses found.", HttpStatus.OK.value(), null)
            );
        }

        List<CourseResponse> responseCourses = courseList.stream().map(courseMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Active courses found.", HttpStatus.OK.value(), responseCourses)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getById(String courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow(
                () -> new NotFoundException("Course not found!")
        );

        CourseResponse responseCourse = courseMapper.convertToDTO(course);
        return ResponseEntity.ok(
                new BaseResponse("Course found.", HttpStatus.OK.value(), responseCourse)
        );
    }


    @Override
    public ResponseEntity<BaseResponse> updateById(String courseId, CourseRequest newCourse) {
        Course course = courseRepository.findById(courseId).orElseThrow(() ->
                new NotFoundException("Course not found!"));

        Course updatedCourse = courseRepository.save(courseMapper.replaceAll(course, newCourse));

        CourseResponse responseCourse = courseMapper.convertToDTO(updatedCourse);

        return ResponseEntity.ok(
                new BaseResponse("Course updated successfully.", HttpStatus.OK.value(), responseCourse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> softDelete(String courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow(() ->
                new NotFoundException("Course not found!"));

        course.setIsDeleted(true);

        Course updatedCourse = courseRepository.save(course);
        CourseResponse responseCourse = courseMapper.convertToDTO(updatedCourse);

        return ResponseEntity.ok(
                new BaseResponse("Course soft-deleted successfully.", HttpStatus.OK.value(), responseCourse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> restore(String courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow(() ->
                new NotFoundException("Course not found!"));

        course.setIsDeleted(false);

        Course updatedCourse = courseRepository.save(course);
        CourseResponse responseCourse = courseMapper.convertToDTO(updatedCourse);

        return ResponseEntity.ok(
                new BaseResponse("Course restored successfully.", HttpStatus.OK.value(), responseCourse)
        );
    }




    @Override
    public ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(String courseName) {
        List<Course> courseList = courseRepository.searchByClassNameContainingIgnoreCase(courseName);

        if (courseList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy Course có tên này.", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        List<CourseResponse> responseCourses = courseList.stream().map(courseMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách khóa học.", HttpStatus.OK.value(), responseCourses)
        );
    }





}
