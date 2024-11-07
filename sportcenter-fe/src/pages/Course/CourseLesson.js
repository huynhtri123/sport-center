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

// Define the desired order for lesson levels
const levelOrder = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

function CourseLesson() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState(null); // State to track the selected lesson level

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

    // Filter lessons based on selected level
    const filteredLessons = selectedLevel ? groupedLessons[selectedLevel] : course.lessons;

    return (
        <div className={styles.courseContainer}>
            <aside className={styles.sidebar}>
                <h2>Mục Lục</h2>
                {/* Button to show all lessons */}
                <div 
                    className={styles.lessonLevel} 
                    onClick={() => setSelectedLevel(null)} // Set selected level to null to show all
                    style={{ cursor: 'pointer', color: selectedLevel === null ? 'lightblue' : 'white' }} // Change color if showing all
                >
                    <span role="img" aria-label="All Levels">🌟</span> {/* Icon for all levels */}
                    <span>ALL LEVEL</span> {/* Text for all levels */}
                </div>
                {levelOrder.map((level) => (
                    groupedLessons[level] && groupedLessons[level].length > 0 && (
                        <div 
                            key={level} 
                            className={styles.lessonLevel}
                            onClick={() => setSelectedLevel(level)} // Set the selected level on click
                            style={{ cursor: 'pointer' }} // Show pointer cursor on hover
                        >
                            {levelIcons[level]} {/* Icon for lesson level */}
                            <span>{level}</span>
                        </div>
                    )
                ))}
            </aside>
            <div className={styles.lessonGrid}>
                {filteredLessons.length > 0 ? (
                    filteredLessons.map((lesson) => (
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
                    ))
                ) : (
                    <p>No lessons available for this level.</p>
                )}
            </div>
        </div>
    );
}

export default CourseLesson;
