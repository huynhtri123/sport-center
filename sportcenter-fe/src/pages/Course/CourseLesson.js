import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import courseApi from '../../services/api/courseApi';
import styles from '../../assets/css/Course/courseLesson.module.scss';

function CourseLesson() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await courseApi.getById(courseId);
                setCourse(response.data);
            } catch (error) {
                console.error('Error fetching course:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!course) {
        return <div>Course not found.</div>;
    }

    return (
        <div className={styles.courseContainer}>
            {course.lessons && course.lessons.length > 0 ? (
                <div className={styles.lessonGrid}>
                    {course.lessons.map((lesson) => (
                        <div className={styles.lessonCard} key={lesson.id}>
                            {lesson.videoId && (
                                <iframe
                                    src={`https://www.youtube.com/embed/${lesson.videoId}`}
                                    title={lesson.lessonName}
                                    allowFullScreen
                                ></iframe>
                            )}
                            <h3>{lesson.lessonName}</h3>
                            <p>Course Sport Type: {lesson.courseSportType}</p>
                            <p>Description: {lesson.description}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No lessons available for this course.</p>
            )}
        </div>
    );
}

export default CourseLesson;
