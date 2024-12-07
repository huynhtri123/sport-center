import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseContext from '../../contexts/Course/CourseContext';
import courseApi from '../../services/api/courseApi';
import styles from '../../assets/css/Course/courseList.module.scss';
import formatCurrency from '../../utils/formatCurrency';

function CourseList() {
    const [courses, setCourses] = useContext(CourseContext);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await courseApi.getAllActive(0, 100);
                setCourses(response.data.content);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, [setCourses]);

    return (
        <div className={styles.container}>
            {/* Banner Section */}
            <div className={styles.banner}>
                <div className={styles.bannerOverlay}></div>
                <h1>Unlock Your Potential</h1>
                <p>Start your learning journey with our variety of courses today.</p>
            </div>

            {/* Course List Section */}
            <ul className={styles.courseList}>
                {courses.map((course) => (
                    <li key={course.id} className={styles.courseItem}>
                        <Link to={`/courses/${course.id}`} className={styles.courseLink}>
                            <div className={styles.card}>
                                <div className={styles.imageContainer}>
                                    <img src={course.imageUrl} alt={course.courseName} className={styles.courseImage} />
                                </div>
                                <div className={styles.courseInfo}>
                                    <h3>{course.courseName}</h3>
                                    <p>
                                        {/* <strong>Tuition:</strong> ${formatCurrency(course.tuition)} */}
                                        <strong>Tuition:</strong> {formatCurrency(0)}
                                    </p>
                                    <p>{course.description}</p>
                                </div>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CourseList;
