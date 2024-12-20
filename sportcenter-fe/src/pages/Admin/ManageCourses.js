import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../assets/css/Admin/manageCourses.module.scss';
import courseApi from '../../services/api/courseApi';
import sportApi from '../../services/api/sportApi'; // Import sport API
import { Loading } from '../../components/Loading/Loading';

function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({
        courseName: '',
        description: '',
        tuition: '',
        imageUrl: '',
        sportId: '', // Added field for selected sport
        lessons: [],
    });
    const [editingCourse, setEditingCourse] = useState(null);
    const [lessonCount, setLessonCount] = useState(0);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sports, setSports] = useState([]); // To store list of sports

    // Define LevelLesson Enum for lesson levels
    const LevelLesson = {
        BEGINNER: 'BEGINNER',
        INTERMEDIATE: 'INTERMEDIATE',
        ADVANCED: 'ADVANCED',
        EXPERT: 'EXPERT',
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5); // Set page size to 5
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchSports(); // Fetch sports on component mount
    }, [currentPage, pageSize, searchQuery]);

    // Fetch courses
    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await courseApi.getAllActive(currentPage, pageSize);
            setCourses(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);

    // Fetch sports list
    const fetchSports = async () => {
        try {
            const response = await sportApi.getAllActive(0, 100); // Assume this API fetches all sports
            setSports(response.data.content);
        } catch (error) {
            console.error('Failed to fetch sports:', error);
            toast.error('Failed to fetch sports. Please try again.');
        }
    };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setCurrentPage(0); // Reset to the first page when searching
        try {
            const response = await courseApi.searchByNameAndPaginate(value, 0, pageSize);
            setCourses(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error('Failed to search courses:', error);
        }
    };

    const handleAddCourse = async () => {
        // Validate the form before submitting
        if (!validateForm()) return; // Stop submission if validation fails

        try {
            const response = await courseApi.create(newCourse);
            setCourses([...courses, response.data]);
            toast.success('Course added successfully!');
            resetForm();
            fetchCourses(); // Refresh the course list
        } catch (error) {
            console.error('Failed to add course:', error);
        }
    };

    const validateForm = () => {
        // Check if courseName, description, tuition, and imageUrl are filled
        if (!newCourse.courseName || !newCourse.description || !newCourse.imageUrl) {
            toast.warn('Please fill in all the course details (name, description, tuition, image URL)!');
            return false;
        }
        if (editingCourse && newCourse.tuition === '') {
            toast.warn('Please fill in Tuition!');
        } else if (Number(newCourse.tuition) < 0) {
            toast.warn('Tuition cannot be negative!');
            return false;
        }

        // Check if sportId is selected
        if (!newCourse.sportId) {
            toast.warn('Please select a sport!');
            return false;
        }

        // Check if lessons are added and each lesson has a valid level
        if (newCourse.lessons.length === 0) {
            toast.warn('Please add at least one lesson!');
            return false;
        }

        for (const lesson of newCourse.lessons) {
            if (!lesson.lessonName || !lesson.description || !lesson.levelLesson) {
                toast.warn('Please fill in all lesson details (name, description, and level)!');
                return false;
            }
        }

        return true;
    };

    const handleEditCourse = (course) => {
        setEditingCourse(course);
        setNewCourse({
            courseName: course.courseName,
            description: course.description,
            tuition: course.tuition,
            imageUrl: course.imageUrl,
            sportId: course.sportId || '', // Make sure to set sportId
            lessons: course.lessons || [],
        });
        setLessonCount(course.lessons ? course.lessons.length : 0);
        setIsFormVisible(true);
    };

    const handleUpdateCourse = async () => {
        // Validate the form before submitting
        if (!validateForm()) return; // Stop submission if validation fails

        try {
            const response = await courseApi.update(editingCourse.id, newCourse);
            setCourses(courses.map((course) => (course.id === editingCourse.id ? response.data : course)));
            toast.success('Course updated successfully!');
            resetForm();
            fetchCourses(); // Refresh the course list
        } catch (error) {
            console.error('Failed to update course:', error);
            // toast.error('Failed to update course. Please try again.');
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
        setNewCourse({ courseName: '', description: '', tuition: '', imageUrl: '', sportId: '', lessons: [] });
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
                lessonName: '',
                description: '',
                levelLesson: '', // Initialize empty value for levelLesson
                videoId: '',
            });
        }
        setNewCourse({ ...newCourse, lessons });
    };

    return (
        <div className={styles.manageCourses}>
            {isLoading && <Loading />}

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

            {isFormVisible && (
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

                    {/* Select Sport */}
                    <select
                        value={newCourse.sportId}
                        onChange={(e) => setNewCourse({ ...newCourse, sportId: e.target.value })}
                    >
                        <option value=''>Select Sport</option>
                        {sports.map((sport) => (
                            <option key={sport.id} value={sport.id}>
                                {sport.sportName}
                            </option>
                        ))}
                    </select>

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

                            {/* Level select */}
                            <select
                                value={lesson.levelLesson}
                                onChange={(e) => handleLessonChange(index, 'levelLesson', e.target.value)}
                            >
                                <option value=''>Select Level</option>
                                <option value={LevelLesson.BEGINNER}>Beginner</option>
                                <option value={LevelLesson.INTERMEDIATE}>Intermediate</option>
                                <option value={LevelLesson.ADVANCED}>Advanced</option>
                                <option value={LevelLesson.EXPERT}>Expert</option>
                            </select>

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
