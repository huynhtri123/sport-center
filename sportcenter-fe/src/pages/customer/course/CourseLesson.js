import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import courseApi from '../../../services/api/course/courseApi';
import styles from '../../../assets/css/course/courseLesson.module.scss';
import clsx from 'clsx';

// Icons for different lesson levels
const levelIcons = {
    BEGINNER: <i className='fas fa-child' aria-hidden='true'></i>,
    INTERMEDIATE: <i className='fas fa-user-graduate' aria-hidden='true'></i>,
    ADVANCED: <i className='fas fa-award' aria-hidden='true'></i>,
    EXPERT: <i className='fas fa-crown' aria-hidden='true'></i>,
};

// Labels for lesson levels
const levelLabels = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
    EXPERT: 'Expert',
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
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!course) {
        return <div className={styles.error}>Course not found.</div>;
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
                <div className={styles.courseHeader}>
                    <img src={course.imageUrl} alt={course.courseName} className={styles.courseImage} />
                    <h2 title={course.courseName}>{course.courseName}</h2>
                    <p>{course.description}</p>
                </div>

                <h2>Lesson Sections</h2>
                {levelOrder.map((level) => {
                    if (groupedLessons[level] && groupedLessons[level].length > 0) {
                        return (
                            <div key={level}>
                                <div
                                    className={styles.lessonLevel}
                                    onClick={() => {
                                        setExpandedSections((prev) => ({
                                            ...prev,
                                            [level]: !prev[level],
                                        }));
                                    }}
                                >
                                    <span style={{ width: '20px', textAlign: 'center' }}>{levelIcons[level]}</span>
                                    <span>{levelLabels[level]}</span>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
            </aside>

            <section className={styles.lessonSection}>
                {levelOrder.map((level) => {
                    if (groupedLessons[level] && groupedLessons[level].length > 0) {
                        return (
                            <div key={level}>
                                {expandedSections[level] && (
                                    <div>
                                        <h3 className={styles.sectionHeader}>
                                            {levelIcons[level]} <span> </span> {levelLabels[level]}
                                        </h3>
                                        <div className={styles.lessonGrid}>
                                            {groupedLessons[level].map((lesson) => (
                                                <div className={clsx(styles.lessonCard, 'mb-4')} key={lesson.id}>
                                                    {lesson.videoId && (
                                                        <iframe
                                                            src={`https://www.youtube.com/embed/${lesson.videoId}`}
                                                            title={lesson.lessonName}
                                                            allowFullScreen
                                                        ></iframe>
                                                    )}
                                                    <h4>{lesson.lessonName}</h4>
                                                    <p>Description: {lesson.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null;
                })}
            </section>
        </div>
    );
}

export default CourseLesson;
