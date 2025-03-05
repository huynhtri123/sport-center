/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { motion } from 'framer-motion';
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

    useEffect(() => {
        const fetchSports = async () => {
            try {
                const sportsResponse = await sportApi.getAllActive(0, 100);
                setSports(sportsResponse.data.content);
            } catch (error) {
                console.error('Error fetching sports:', error);
            }
        };

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
        fetchSports();
    }, [setCourses]);

    useEffect(() => {
        setFilteredCourses(filter === 'All' ? courses : courses.filter((course) => course.sportId === filter));
    }, [filter, courses]);

    return (
        <div className={styles.container}>
            <section className={styles.banner}>
                <div className={styles.bannerContent}>
                    <h1>Discover Your Passion for Sports</h1>
                    <p>Find the best courses to enhance your skills.</p>
                </div>
            </section>

            <div className={styles.filterContainer}>
                <Button
                    className={`${styles.btnFilter} ${filter === 'All' ? styles.active : ''}`}
                    onClick={() => setFilter('All')}
                >
                    All
                </Button>

                {sports.map((sport) => (
                    <Button
                        key={sport.id}
                        className={`${styles.btnFilter} ${filter === sport.id ? styles.active : ''}`}
                        onClick={() => setFilter(sport.id)}
                    >
                        {sport.sportName}
                    </Button>
                ))}
            </div>

            <motion.ul className={styles.courseGrid} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <motion.li key={course.id} className={styles.courseCard} whileHover={{ scale: 1.05 }}>
                            <Link to={`/courses/${course.id}`}>
                                <img src={course.imageUrl} alt={course.courseName} className={styles.courseImage} />
                                <div className={styles.courseDetails}>
                                    <h3>{course.courseName}</h3>
                                    {/* <p>{formatCurrency(course.tuition)}</p> */}
                                    <p className={styles.courseDescription}>{course.description}</p>
                                </div>
                            </Link>
                        </motion.li>
                    ))
                ) : (
                    <p className={styles.noCourses}>No courses available for this sport.</p>
                )}
            </motion.ul>
        </div>
    );
}

export default CourseList;
