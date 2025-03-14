/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Pagination, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import courseApi from '../../../services/api/course/courseApi';
import sportApi from '../../../services/api/sport/sportApi';
import styles from '../../../assets/css/Admin/course/manageCourses.module.scss';

const { confirm } = Modal;

function ManageCourses() {
    const [courses, setCourses] = useState([]);
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingCourse, setEditingCourse] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalElements, setTotalElements] = useState(0);

    const lessonLevels = [
        { label: 'Beginner', value: 'BEGINNER' },
        { label: 'Intermediate', value: 'INTERMEDIATE' },
        { label: 'Advanced', value: 'ADVANCED' },
        { label: 'Expert', value: 'EXPERT' },
    ];

    useEffect(() => {
        fetchCourses();
        fetchSports();
    }, [currentPage, pageSize, searchQuery]);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await courseApi.getAllActive(currentPage - 1, pageSize);
            let filteredCourses = response.data.content;

            if (searchQuery) {
                filteredCourses = filteredCourses.filter((course) =>
                    course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            setCourses(filteredCourses);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchQuery]);

    const fetchSports = async () => {
        try {
            const response = await sportApi.getAllActive(0, 100);
            setSports(response.data.content);
        } catch (error) {
            console.error('Failed to fetch sports:', error);
            message.error('Failed to fetch sports. Please try again.');
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const showAddModal = () => {
        setEditingCourse(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (course) => {
        setEditingCourse(course);
        form.setFieldsValue({ ...course });
        setIsModalVisible(true);
    };

    const handleDeleteCourse = async (courseId) => {
        confirm({
            title: 'Are you sure you want to delete this course?',
            icon: <ExclamationCircleOutlined />,
            onOk: async () => {
                try {
                    await courseApi.softDelete(courseId);
                    setCourses(courses.filter((course) => course.id !== courseId));
                    message.success('Course deleted successfully!');
                    fetchCourses();
                } catch (error) {
                    console.error('Failed to delete course:', error);
                    message.error('Failed to delete course. Please try again.');
                }
            },
        });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const updatedLessons = values.lessons.map((lesson, index) => ({
                ...lesson,
                id: lesson.id || `temp-${index}`, // Nếu là bài học mới, gán ID tạm thời
                level: lesson.level || 'BEGINNER', // Đảm bảo level luôn có giá trị
            }));

            const courseData = {
                ...values,
                lessons: updatedLessons,
            };

            if (editingCourse) {
                await courseApi.update(editingCourse.id, courseData);
                message.success('Course updated successfully!');
            } else {
                await courseApi.create(courseData);
                message.success('Course added successfully!');
            }
            setIsModalVisible(false);
            fetchCourses();
        } catch (error) {
            console.error('Failed to save course:', error);
            message.error('Failed to save course. Please try again.');
        }
    };

    const columns = [
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            className: styles.rowTable,
            render: (url) => <img src={url} alt='Course' style={{ width: 80, height: 80, objectFit: 'cover' }} />,
        },
        {
            title: 'Course Name',
            dataIndex: 'courseName',
            key: 'courseName',
            className: styles.rowTable,
            sorter: (a, b) => a.courseName.localeCompare(b.courseName),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            className: styles.rowTable,
        },
        {
            title: 'Tuition',
            dataIndex: 'tuition',
            key: 'tuition',
            className: styles.rowTable,
            sorter: (a, b) => a.tuition - b.tuition,
        },
        {
            title: 'Sport',
            dataIndex: 'sportId',
            key: 'sportId',
            className: styles.rowTable,
            filters: sports.map((sport) => ({ text: sport.sportName, value: sport.id })),
            onFilter: (value, record) => record.sportId === value,
            render: (id) => <span>{sports.find((sport) => sport.id === id)?.sportName || 'N/A'}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            className: styles.rowTable,
            render: (_, record) => (
                <>
                    <Button className={styles.editButton} type='link' onClick={() => showEditModal(record)}>
                        Edit
                    </Button>
                    <Button
                        className={styles.deleteButton}
                        type='link'
                        danger
                        onClick={() => handleDeleteCourse(record.id)}
                    >
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            {/* Search & Add New Course */}
            <Input
                className={styles.searchBar}
                placeholder='Search courses...'
                value={searchQuery}
                onChange={handleSearch}
            />
            <Button className={styles.addButton} type='primary' onClick={showAddModal}>
                Add New Course
            </Button>

            {/* Table */}
            <Table
                className={styles.courseTable}
                dataSource={courses}
                columns={columns}
                rowKey='id'
                loading={loading}
                pagination={false}
            />
            <Pagination
                className={styles.pagination}
                current={currentPage}
                total={totalElements}
                pageSize={pageSize}
                showSizeChanger={false}
                onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                }}
            />

            <Modal
                className={styles.modal}
                title={editingCourse ? 'Edit Course' : 'Add Course'}
                visible={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => setIsModalVisible(false)}
                width={1000}
                style={{ top: 40 }}
            >
                <Form form={form} layout='vertical'>
                    <Form.Item
                        name='courseName'
                        label='Course Name'
                        rules={[{ required: true, message: 'Please enter the course name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name='description'
                        label='Description'
                        rules={[{ required: true, message: 'Please enter the course description!' }]}
                    >
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                        name='tuition'
                        label='Tuition'
                        rules={[{ required: true, message: 'Please enter a valid tuition fee!' }]}
                    >
                        <Input type='number' min={0} step={1000} />
                    </Form.Item>

                    <Form.Item
                        name='imageUrl'
                        label='Image URL'
                        rules={[{ required: true, message: 'Please provide an image URL!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name='sportId'
                        label='Sport'
                        rules={[{ required: true, message: 'Please select a sport!' }]}
                    >
                        <Select>
                            {sports.map((sport) => (
                                <Select.Option key={sport.id} value={sport.id}>
                                    {sport.sportName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Lesson */}
                    <Form.List name='lessons'>
                        {(fields, { add, remove }) => (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} className={styles.lessonCard}>
                                        <div className={styles.lessonHeader}>
                                            <h3>Lesson {name + 1}</h3>
                                            <Button
                                                className={styles.removeButton}
                                                type='danger'
                                                onClick={() => {
                                                    Modal.confirm({
                                                        title: 'Are you sure you want to remove this lesson?',
                                                        icon: <ExclamationCircleOutlined />,
                                                        content: 'This action cannot be undone.',
                                                        okText: 'Yes, Remove',
                                                        cancelText: 'Cancel',
                                                        onOk: () => remove(name),
                                                    });
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <div className={styles.lessonContent}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'lessonName']}
                                                label='Lesson Name'
                                                rules={[{ required: true, message: 'Please enter lesson name!' }]}
                                            >
                                                <Input placeholder='Enter lesson name' />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'description']}
                                                label='Lesson Description'
                                                rules={[
                                                    { required: true, message: 'Please enter lesson description!' },
                                                ]}
                                            >
                                                <Input.TextArea placeholder='Enter lesson description' />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'videoId']}
                                                label='Video ID'
                                                rules={[{ required: true, message: 'Please enter video ID!' }]}
                                            >
                                                <Input placeholder='Enter video ID' />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'levelLesson']}
                                                label='Lesson Level'
                                                rules={[{ required: true, message: 'Please select a lesson level!' }]}
                                            >
                                                <Select placeholder='Select level'>
                                                    {lessonLevels.map((level) => (
                                                        <Select.Option key={level.value} value={level.value}>
                                                            {level.label}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </div>
                                    </div>
                                ))}
                                <Button className={styles.addButton} type='dashed' onClick={() => add()}>
                                    + Add Lesson
                                </Button>
                            </div>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </div>
    );
}

export default ManageCourses;
