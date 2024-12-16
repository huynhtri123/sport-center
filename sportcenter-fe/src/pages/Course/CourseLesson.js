import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import courseApi from '../../services/api/courseApi';
import styles from '../../assets/css/Course/courseLesson.module.scss';

// Icons for different lesson levels
const levelIcons = {
    BEGINNER: <span role="img" aria-label="Beginner">👶</span>,
    INTERMEDIATE: <span role="img" aria-label="Intermediate">🧑</span>,
    ADVANCED: <span role="img" aria-label="Advanced">👨‍🎓</span>,
    EXPERT: <span role="img" aria-label="Expert">🏆</span>,
};

// Đối tượng ánh xạ cho các mức độ
const levelLabels = {
    BEGINNER: 'Người mới',
    INTERMEDIATE: 'Trung cấp',
    ADVANCED: 'Nâng cao',
    EXPERT: 'Chuyên gia',
};

// Define the desired order for lesson levels
const levelOrder = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

function CourseLesson() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({}); // State to track expanded sections

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

    // Group lessons by level
    const groupedLessons = course.lessons.reduce((acc, lesson) => {
        const level = lesson.levelLesson;
        if (!acc[level]) {
            acc[level] = [];
        }
        acc[level].push(lesson);
        return acc;
    }, {});

    return (
        <div className={styles.courseContainer}>
            <aside className={styles.sidebar}>
                {/* Course Image and Info */}
                <div className={styles.courseHeader}>
                    <img src={course.imageUrl} alt={course.courseName} className={styles.courseImage} />
                    <h2>{course.courseName}</h2>
                    <p>{course.description}</p>
                </div>

                <h2>Danh sách các chương</h2>
                {levelOrder.map((level) => {
                    // Check if lessons for this level exist
                    if (groupedLessons[level] && groupedLessons[level].length > 0) {
                        return (
                            <div key={level}>
                                <div 
                                    className={styles.lessonLevel} 
                                    onClick={() => {
                                        setExpandedSections((prev) => ({
                                            ...prev,
                                            [level]: !prev[level], // Toggle the visibility of the section
                                        }));
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {levelIcons[level]}
                                    <span>{levelLabels[level]}</span> {/* Hiển thị tên mức độ đã chuyển đổi */}
                                </div>
                                {expandedSections[level] && ( // Show videos only if the section is expanded
                                    <div className={styles.lessonGrid}>
                                        {groupedLessons[level].map((lesson) => (
                                            <div className={styles.lessonCard} key={lesson.id}>
                                                {lesson.videoId && (
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${lesson.videoId}`}
                                                        title={lesson.lessonName}
                                                        allowFullScreen
                                                    ></iframe>
                                                )}
                                                <h4>{lesson.lessonName}</h4>
                                                <p>Course Sport Type: {lesson.courseSportType}</p>
                                                <p>Description: {lesson.description}</p>
                                                <p>Skill Level: {lesson.levelLesson}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null; // Không trả về gì nếu không có bài học cho mức độ đó
                })}
            </aside>
        </div>
    );
}

export default CourseLesson;