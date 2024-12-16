package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.CourseSportType;
import app.sportcenter.commons.PaginatedResponse;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.CourseRequest;
import app.sportcenter.models.dto.CourseResponse;
import app.sportcenter.models.entities.Course;
import app.sportcenter.models.entities.Lesson;
import app.sportcenter.repositories.CourseRepository;
import app.sportcenter.services.CourseService;
import app.sportcenter.utils.mappers.CourseMapper;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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
    public ResponseEntity<BaseResponse> getAllActive(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Course> activeCoursesPage = courseRepository.findAllActive(pageable);

        if (activeCoursesPage.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy khóa học nào đang hoạt động", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        List<CourseResponse> response = activeCoursesPage.getContent()
                .stream()
                .map(courseMapper::convertToDTO)
                .collect(Collectors.toList());

        // Create a PaginatedResponse object
        PaginatedResponse<CourseResponse> paginatedResponse = new PaginatedResponse<>(
                response,
                activeCoursesPage.getTotalPages(),
                activeCoursesPage.getTotalElements()
        );

        // Return the BaseResponse with paginated data
        return ResponseEntity.ok(
                new BaseResponse(
                        "Tìm thấy danh sách khóa học đang hoạt động",
                        HttpStatus.OK.value(),
                        paginatedResponse
                )
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

        // Update course and its lessons
        Course updatedCourse = courseMapper.replaceAll(course, newCourse);
        courseRepository.save(updatedCourse);

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

    @Override
    public ResponseEntity<BaseResponse> deleteLessonFromCourse(String courseId, String lessonId) {
        // Find the course by ID
        Course course = courseRepository.findById(courseId).orElseThrow(() ->
                new NotFoundException("Course not found!"));

        // Check if the lesson exists in the course
        List<Lesson> lessons = course.getLessons();
        Lesson lessonToRemove = lessons.stream()
                .filter(lesson -> lesson.getId().equals(lessonId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Lesson not found in this course!"));

        // Remove the lesson from the list
        lessons.remove(lessonToRemove);
        course.setLessons(lessons);

        // Save the updated course
        Course updatedCourse = courseRepository.save(course);
        CourseResponse responseCourse = courseMapper.convertToDTO(updatedCourse);

        return ResponseEntity.ok(
                new BaseResponse("Lesson deleted successfully.", HttpStatus.OK.value(), responseCourse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> searchByNameAndPaginate(String courseName, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Course> coursePage = courseRepository.searchByNameContainingIgnoreCase(courseName, pageable);

//        if (coursePage.isEmpty()) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
//                    new BaseResponse("Không tìm thấy khóa học nào với tên này.", HttpStatus.NOT_FOUND.value(), null)
//            );
//        }

        List<CourseResponse> responseCourses = coursePage.getContent()
                .stream()
                .map(courseMapper::convertToDTO)
                .collect(Collectors.toList());

        PaginatedResponse<CourseResponse> paginatedResponse = new PaginatedResponse<>(
                responseCourses,
                coursePage.getTotalPages(),
                coursePage.getTotalElements()
        );

        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách khóa học.", HttpStatus.OK.value(), paginatedResponse)
        );
    }




}
