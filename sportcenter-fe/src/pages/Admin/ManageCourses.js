import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../assets/css/Admin/manageCourses.module.scss';
import courseApi from '../../services/api/courseApi';
import { Loading } from '../../components/Loading/Loading';

function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({
        courseName: '',
        description: '',
        tuition: '',
        imageUrl: '',
        lessons: [],
    });
    const [editingCourse, setEditingCourse] = useState(null);
    const [lessonCount, setLessonCount] = useState(0);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5); // Set page size to 5
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, [currentPage, pageSize, searchQuery]);

    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await courseApi.getAllActive(currentPage, pageSize);
            setCourses(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            toast.error('Failed to fetch courses. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setCurrentPage(0); // Đặt lại trang về 0 khi tìm kiếm
        try {
            const response = await courseApi.searchByNameAndPaginate(value, 0, pageSize);
            setCourses(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error('Failed to search courses:', error);
            toast.error('Failed to search courses. Please try again.');
        }
    };

    const handleAddCourse = async () => {
        try {
            const response = await courseApi.create(newCourse);
            setCourses([...courses, response.data]);
            toast.success('Course added successfully!');
            resetForm();
            fetchCourses(); // Refresh the course list
        } catch (error) {
            console.error('Failed to add course:', error);
            toast.error('Failed to add course. Please try again.');
        }
    };

    const handleEditCourse = (course) => {
        setEditingCourse(course);
        setNewCourse({
            courseName: course.courseName,
            description: course.description,
            tuition: course.tuition,
            imageUrl: course.imageUrl,
            lessons: course.lessons || [],
        });
        setLessonCount(course.lessons ? course.lessons.length : 0);
        setIsFormVisible(true);
    };

    const handleUpdateCourse = async () => {
        try {
            const response = await courseApi.update(editingCourse.id, newCourse);
            setCourses(courses.map((course) => (course.id === editingCourse.id ? response.data : course)));
            toast.success('Course updated successfully!');
            resetForm();
            fetchCourses(); // Refresh the course list
        } catch (error) {
            console.error('Failed to update course:', error);
            toast.error('Failed to update course. Please try again.');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        try {
            await courseApi.softDelete(courseId);
            setCourses(courses.filter((course) => course.id !== courseId));
            toast.success('Course deleted successfully!');
            fetchCourses(); // Refresh the course list
        } catch (error) {
            console.error('Failed to delete course:', error);
            toast.error('Failed to delete course. Please try again.');
        }
    };

    const resetForm = () => {
        setNewCourse({ courseName: '', description: '', tuition: '', imageUrl: '', lessons: [] });
        setLessonCount(0);
        setEditingCourse(null);
        setIsFormVisible(false);
    };

    // Filter courses based on search query
    const filteredCourses = courses.filter((course) =>
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLessonChange = (index, field, value) => {
        const updatedLessons = [...newCourse.lessons];
        updatedLessons[index] = { ...updatedLessons[index], [field]: value };
        setNewCourse({ ...newCourse, lessons: updatedLessons });
    };

    const handleAddLessonFields = () => {
        const lessons = [];
        for (let i = 0; i < lessonCount; i++) {
            lessons.push({
                courseSportType: '',
                lessonName: '',
                description: '',
                levelLesson: '',
                videoId: '',
            });
        }
        setNewCourse({ ...newCourse, lessons });
    };

    return (
        <div className={styles.manageCourses}>
            {isLoading && <Loading />}
            <h2>Manage Courses</h2>

            <div className={styles.searchContainer}>
                <input
                    type='text'
                    placeholder='Search by course name...'
                    value={searchQuery}
                    onChange={handleSearch}
                    className={styles.searchInput}
                />
            </div>

            <button className={`btn ${styles.addButton}`} onClick={() => setIsFormVisible((prev) => !prev)}>
                {isFormVisible ? 'Cancel' : 'Add New Course'}
            </button>

            {filteredCourses.length === 0 ? (
                <p>No courses available.</p>
            ) : (
                <table className={styles.coursesTable}>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Course Name</th>
                            <th>Description</th>
                            <th>Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCourses.map((course, index) => (
                            <tr key={course.id}>
                                <td>{index + 1 + currentPage * pageSize}</td>
                                <td>{course.courseName}</td>
                                <td>{course.description}</td>
                                <td>
                                    <img src={course.imageUrl} alt={course.courseName} className={styles.courseImage} />
                                </td>
                                <td>
                                    <button
                                        className={`btn ${styles.editButton}`}
                                        onClick={() => handleEditCourse(course)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={`btn ${styles.deleteButton}`}
                                        onClick={() => handleDeleteCourse(course.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {isFormVisible && ( // Conditionally render the form
                <div className={styles.formContainer}>
                    <h3>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
                    <input
                        type='text'
                        placeholder='Course Name'
                        value={newCourse.courseName}
                        onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                    />
                    <input
                        type='text'
                        placeholder='Description'
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    />
                    <input
                        type='number'
                        placeholder='Tuition'
                        value={newCourse.tuition}
                        onChange={(e) => setNewCourse({ ...newCourse, tuition: e.target.value })}
                    />
                    <input
                        type='text'
                        placeholder='Image URL'
                        value={newCourse.imageUrl}
                        onChange={(e) => setNewCourse({ ...newCourse, imageUrl: e.target.value })}
                    />

                    <input
                        type='number'
                        placeholder='Number of Lessons'
                        value={lessonCount}
                        onChange={(e) => setLessonCount(Number(e.target.value))}
                        onBlur={handleAddLessonFields}
                    />

                    {newCourse.lessons.map((lesson, index) => (
                        <div key={index} className={styles.lessonContainer}>
                            <h4>{`Lesson ${index + 1}`}</h4>
                            <input
                                type='text'
                                placeholder='Course Sport Type'
                                value={lesson.courseSportType}
                                onChange={(e) => handleLessonChange(index, 'courseSportType', e.target.value)}
                            />
                            <input
                                type='text'
                                placeholder='Lesson Name'
                                value={lesson.lessonName}
                                onChange={(e) => handleLessonChange(index, 'lessonName', e.target.value)}
                            />
                            <input
                                type='text'
                                placeholder='Description'
                                value={lesson.description}
                                onChange={(e) => handleLessonChange(index, 'description', e.target.value)}
                            />
                            <input
                                type='text'
                                placeholder='Level'
                                value={lesson.levelLesson}
                                onChange={(e) => handleLessonChange(index, 'levelLesson', e.target.value)}
                            />
                            <input
                                type='text'
                                placeholder='Video ID'
                                value={lesson.videoId}
                                onChange={(e) => handleLessonChange(index, 'videoId', e.target.value)}
                            />
                        </div>
                    ))}

                    <button
                        className={`btn ${styles.addButton}`}
                        onClick={editingCourse ? handleUpdateCourse : handleAddCourse}
                    >
                        {editingCourse ? 'Update Course' : 'Add Course'}
                    </button>
                </div>
            )}

            <div className={styles.pagination}>
                <button disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>
                    Previous
                </button>
                <span>{`Page ${currentPage + 1} of ${totalPages}`}</span>
                <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default ManageCourses;
