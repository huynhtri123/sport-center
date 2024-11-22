import axiosClient from './axiosClient';

const courseApi = {
    // Create a new course
    create(courseRequest) {
        return axiosClient.post('/course/create', courseRequest);
    },

    // Get a course by ID
    getById(courseId) {
        return axiosClient.get(`/public/course/getById/${courseId}`);
    },

    // Update a course by ID
    update(courseId, courseRequest) {
        return axiosClient.put(`/course/updateById/${courseId}`, courseRequest);
    },

    // Soft delete a course by ID
    softDelete(courseId) {
        return axiosClient.patch(`/course/softDelete/${courseId}`);
    },

    // Restore a soft-deleted course by ID
    restore(courseId) {
        return axiosClient.patch(`/course/restore/${courseId}`);
    },

    // Get all active courses
    getAllActive(page = 0, size = 3) {
        return axiosClient.get(`/public/course/getAllActive?page=${page}&size=${size}`);
    },

    // Search courses by name
    searchByName(courseName) {
        return axiosClient.get('/public/course/searchByName', { params: { courseName } });
    },
};

export default courseApi;
