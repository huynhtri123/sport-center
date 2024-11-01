// CourseList.js
import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseContext from '../../contexts/Course/CourseContext';
import courseApi from '../../services/api/courseApi';
import styles from '../../assets/css/Course/courseList.module.scss'; // Importing the new CSS module

function CourseList() {
    const [courses, setCourses] = useContext(CourseContext);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await courseApi.getAllActive();
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, [setCourses]);

    return (
        <div className={styles.container}>
            <ul className={styles.courseList}>
                {courses.map((course) => (
                    <li key={course.id} className={styles.courseItem}>
                        <Link to={`/courses/${course.id}`} className={styles.courseLink}>
                            <img src={course.imageUrl} alt={`${course.courseName} image`} className={styles.courseImage} />
                            <div className={styles.courseInfo}>
                                <h2>{course.courseName}</h2>
                                <p>Tuition: ${course.tuition}</p>
                                <p>Description: {course.description}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CourseList;
