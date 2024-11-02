package app.sportcenter.utils.mappers;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.CourseRequest;
import app.sportcenter.models.dto.CourseResponse;
import app.sportcenter.models.dto.LessonResponse;
import app.sportcenter.models.entities.Course;
import app.sportcenter.models.entities.Lesson;
import app.sportcenter.repositories.LessonRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CourseMapper {
    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private LessonRepository lessonRepository;

    public Course convertToEntity(CourseRequest courseRequest) {
        Course course = courseRequest != null ? modelMapper.map(courseRequest, Course.class) : null;

        if (courseRequest != null && courseRequest.getLessonIds() != null) {
            List<Lesson> lessons = courseRequest.getLessonIds().stream()
                    .map(lessonId -> lessonRepository.findById(lessonId)
                            .orElseThrow(() -> new CustomException("Lesson not found with id: " + lessonId, HttpStatus.NOT_FOUND.value())))
                    .collect(Collectors.toList());
            course.setLessons(lessons);
        }

        return course;
    }

    public CourseResponse convertToDTO(Course course) {
        if (course == null) return null;

        CourseResponse courseResponse = modelMapper.map(course, CourseResponse.class);

        if (course.getLessons() != null) {
            List<LessonResponse> lessonResponses = course.getLessons().stream()
                    .map(lesson -> modelMapper.map(lesson, LessonResponse.class))
                    .collect(Collectors.toList());
            courseResponse.setLessons(lessonResponses);
        } else {
            courseResponse.setLessons(List.of());  // Khởi tạo danh sách trống nếu lessons null
        }

        return courseResponse;
    }

    // Ghi đè course mới lên course cũ
    public Course replaceAll(Course oldCourse, CourseRequest newCourse) {
        if (newCourse == null) {
            throw new CustomException("New Field is null!", HttpStatus.BAD_REQUEST.value());
        }
        if (oldCourse == null) {
            throw new CustomException("Old Field is null!", HttpStatus.BAD_REQUEST.value());
        }

        oldCourse.setCourseName(newCourse.getCourseName());
        oldCourse.setDescription(newCourse.getDescription());
        oldCourse.setTuition(newCourse.getTuition());
        oldCourse.setImageUrl(newCourse.getImageUrl());

        return oldCourse;
    }

}
