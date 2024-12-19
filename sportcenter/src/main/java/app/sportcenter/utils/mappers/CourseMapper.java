package app.sportcenter.utils.mappers;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.CourseRequest;
import app.sportcenter.models.dto.CourseResponse;
import app.sportcenter.models.dto.LessonResponse;
import app.sportcenter.models.entities.Course;
import app.sportcenter.models.entities.Lesson;
import app.sportcenter.models.entities.Sport;
import app.sportcenter.repositories.SportRepository;
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
    private SportRepository sportRepository;

    @Autowired
    private LessonRepository lessonRepository;

    // Chuyển CourseRequest thành Course entity
    public Course convertToEntity(CourseRequest courseRequest) {
        if (courseRequest == null) return null;

        // Tạo Course từ CourseRequest
        Course course = modelMapper.map(courseRequest, Course.class);

        // Kiểm tra sportId và gán sport tương ứng
        if (courseRequest.getSportId() != null) {
            Sport sport = findSportById(courseRequest.getSportId());
            course.setSport(sport);
        }

        // Map lessons từ CourseRequest sang Course entity
        if (courseRequest.getLessons() != null) {
            List<Lesson> lessons = courseRequest.getLessons().stream()
                    .map(lessonRequest -> modelMapper.map(lessonRequest, Lesson.class))
                    .collect(Collectors.toList());
            course.setLessons(lessons);
        }

        return course;
    }

    // Chuyển Course entity thành CourseResponse DTO
    public CourseResponse convertToDTO(Course course) {
        if (course == null) return null;

        CourseResponse courseResponse = modelMapper.map(course, CourseResponse.class);

        // Kiểm tra nếu Sport là null
        if (course.getSport() != null) {
            courseResponse.setSportId(course.getSport().getId());
        } else {
            courseResponse.setSportId(null); // Hoặc bạn có thể set giá trị mặc định nếu cần
        }

        // Xử lý lessons
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
            throw new CustomException("New Course is null!", HttpStatus.BAD_REQUEST.value());
        }
        if (oldCourse == null) {
            throw new CustomException("Old Course is null!", HttpStatus.BAD_REQUEST.value());
        }

        // Cập nhật thông tin khóa học
        oldCourse.setCourseName(newCourse.getCourseName());
        oldCourse.setDescription(newCourse.getDescription());
        oldCourse.setTuition(newCourse.getTuition());
        oldCourse.setImageUrl(newCourse.getImageUrl());

        // Kiểm tra và cập nhật sport
        if (newCourse.getSportId() != null) {
            Sport sport = findSportById(newCourse.getSportId());
            oldCourse.setSport(sport);
        }

        // Cập nhật các bài học
        if (newCourse.getLessons() != null) {
            List<Lesson> updatedLessons = newCourse.getLessons().stream()
                    .map(lessonRequest -> modelMapper.map(lessonRequest, Lesson.class))
                    .collect(Collectors.toList());
            oldCourse.setLessons(updatedLessons);
        } else {
            oldCourse.setLessons(List.of()); // Set thành danh sách rỗng nếu không có lessons
        }

        return oldCourse;
    }

    // Tìm sport theo sportId
    private Sport findSportById(String sportId) {
        return sportRepository.findById(sportId)
                .orElseThrow(() -> new CustomException("Sport not found with id: " + sportId, HttpStatus.NOT_FOUND.value()));
    }
}
