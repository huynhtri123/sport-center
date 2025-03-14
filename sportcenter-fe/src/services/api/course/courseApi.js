import axiosClient from '../axiosClient';

const courseApi = {
    // Create a new course
    create(courseRequest) {
        return axiosClient.post('/course/create', courseRequest);
    },

    // Get a course by ID
    getById(courseId) {
        return axiosClient.get(`/public/course/${courseId}`);
    },

    // Update a course by ID
    update(courseId, courseRequest) {
        return axiosClient.put(`/course/update/${courseId}`, courseRequest);
    },

    // Soft delete a course by ID
    softDelete(courseId) {
        return axiosClient.patch(`/course/soft-delete/${courseId}`);
    },

    // Restore a soft-deleted course by ID
    restore(courseId) {
        return axiosClient.patch(`/course/restore/${courseId}`);
    },

    // Get all active courses
    getAllActive(page, size) {
        return axiosClient.get(`/public/course/all-active?page=${page}&size=${size}`);
    },

    searchByNameAndPaginate(courseName, page = 0, size = 5) {
        return axiosClient.get('/public/course/search-by-name-page', { params: { courseName, page, size } });
    },
};

export default courseApi;
