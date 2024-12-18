import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CourseContext from '../../contexts/Course/CourseContext';
import courseApi from '../../services/api/courseApi';
import sportApi from '../../services/api/sportApi';
import styles from '../../assets/css/Course/courseList.module.scss';
import formatCurrency from '../../utils/formatCurrency';

function CourseList() {
    const [courses, setCourses] = useContext(CourseContext);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [filter, setFilter] = useState('All');
    const [sports, setSports] = useState([]);

    const fetchSports = async () => {
        try {
            const sportsResponse = await sportApi.getAllActive(0, 100);
            setSports(sportsResponse.data.content);
        } catch (error) {
            console.error('Error fetching sports:', error);
        }
    };

    // Fetch danh sách courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await courseApi.getAllActive(0, 100);
                setCourses(response.data.content);
                setFilteredCourses(response.data.content);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
        fetchSports(); // Gọi fetchSports khi component mount
    }, [setCourses]);

    // Update filtered courses khi thay đổi bộ lọc
    useEffect(() => {
        if (filter === 'All') {
            setFilteredCourses(courses);
        } else {
            setFilteredCourses(
                courses.filter((course) =>
                    course.lessons.some((lesson) => lesson.courseSportType === filter.toUpperCase())
                )
            );
        }
    }, [filter, courses]);

    const handleFilterChange = (selectedSport) => {
        setFilter(selectedSport);
    };

    return (
        <div className={styles.container}>
            {/* Banner Section */}
            <div className={styles.banner}>
                <div className={styles.bannerOverlay}></div>
                <h1>Unlock Your Potential</h1>
                <p>Start your learning journey with our variety of courses today.</p>
            </div>

            {/* Filter Section */}
            <div className={styles.filterSection}>
                <div className={styles.filterButtons}>
                    {/* Nút "All" luôn hiển thị */}
                    <button
                        className={filter === 'All' ? 'active' : ''}
                        onClick={() => handleFilterChange('All')}
                        aria-pressed={filter === 'All'}
                    >
                        All
                    </button>
                    {/* Render danh sách sport từ API */}
                    {sports.map((sport) => (
                        <button
                            key={sport.id}
                            className={filter === sport.sportName ? 'active' : ''}
                            onClick={() => handleFilterChange(sport.sportName)}
                            aria-pressed={filter === sport.sportName}
                        >
                            {sport.sportName}
                        </button>
                    ))}
                </div>
            </div>

            {/* Course List Section */}
            <ul className={styles.courseList}>
                {filteredCourses.map((course) => (
                    <li key={course.id} className={styles.courseItem}>
                        <Link to={`/courses/${course.id}`} className={styles.courseLink}>
                            <div className={styles.card}>
                                <div className={styles.imageContainer}>
                                    <img src={course.imageUrl} alt={course.courseName} className={styles.courseImage} />
                                </div>
                                <div className={styles.courseInfo}>
                                    <h3>{course.courseName}</h3>
                                    <p>
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
