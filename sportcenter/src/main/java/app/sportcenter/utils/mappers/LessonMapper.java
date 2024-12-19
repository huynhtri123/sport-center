package app.sportcenter.utils.mappers;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.LessonRequest;
import app.sportcenter.models.dto.LessonResponse;
import app.sportcenter.models.entities.Lesson;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class LessonMapper {
    @Autowired
    private ModelMapper modelMapper;

    public Lesson convertToEntity(LessonRequest lessonRequest) {
        return lessonRequest != null ? modelMapper.map(lessonRequest, Lesson.class) : null;
    }

    public LessonResponse convertToDTO(Lesson lesson) {
        return lesson != null ? modelMapper.map(lesson, LessonResponse.class) : null;
    }
    public Lesson replaceAll(Lesson oldLesson, LessonRequest newLesson) {
        if (newLesson == null || oldLesson == null) {
            throw new CustomException("Fields are null!", HttpStatus.BAD_REQUEST.value());
        }

        oldLesson.setLessonName(newLesson.getLessonName());
        oldLesson.setDescription(newLesson.getDescription());
        oldLesson.setVideoId(newLesson.getVideoId());

        return oldLesson;
    }
}
