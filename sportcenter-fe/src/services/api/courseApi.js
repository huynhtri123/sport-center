import axiosClient from './axiosClient';

const courseApi = {
    // Tạo mới một lớp học
    create(courseRequest) {
        const url = '/course/create';
        return axiosClient.post(url, courseRequest)
            .catch(error => {
                console.error('Error creating course:', error);
                throw error; // Hoặc xử lý lỗi theo cách bạn muốn
            });
    },

    // Lấy tất cả các lớp học đang hoạt động (active & not deleted)
    getAllActive() {
        const url = '/course/getAllActive';
        return axiosClient.get(url)
            .catch(error => {
                console.error('Error fetching active courses:', error);
                throw error;
            });
    },

    // Lấy thông tin lớp học theo ID
    getById(courseId) {
        const url = `/course/getById/${courseId}`;
        return axiosClient.get(url)
            .catch(error => {
                console.error(`Error fetching course with ID ${courseId}:`, error);
                throw error;
            });
    },

    // Lấy danh sách tất cả các lớp học đã xóa mềm
    getAllSoftDeleted() {
        const url = '/course/getAllSoftDeleted';
        return axiosClient.get(url)
            .catch(error => {
                console.error('Error fetching soft-deleted courses:', error);
                throw error;
            });
    },

    // Cập nhật thông tin lớp học theo ID
    update(courseId, courseRequest) {
        const url = `/course/update/${courseId}`;
        return axiosClient.put(url, courseRequest)
            .catch(error => {
                console.error(`Error updating course with ID ${courseId}:`, error);
                throw error;
            });
    },

    // Chuyển đổi trạng thái hoạt động của lớp học
    toggleActiveStatus(courseId) {
        const url = `/course/toggleActiveStatus/${courseId}`;
        return axiosClient.patch(url)
            .catch(error => {
                console.error(`Error toggling active status for course ID ${courseId}:`, error);
                throw error;
            });
    },

    // Xóa mềm lớp học theo ID
    softDelete(courseId) {
        const url = `/course/softDelete/${courseId}`;
        return axiosClient.patch(url)
            .catch(error => {
                console.error(`Error soft deleting course with ID ${courseId}:`, error);
                throw error;
            });
    },

    // Khôi phục lớp học đã bị xóa mềm theo ID
    restore(courseId) {
        const url = `/course/restore/${courseId}`;
        return axiosClient.patch(url)
            .catch(error => {
                console.error(`Error restoring course with ID ${courseId}:`, error);
                throw error;
            });
    },

    // Xóa vĩnh viễn lớp học theo ID
    forceDelete(courseId) {
        const url = `/course/forceDelete/${courseId}`;
        return axiosClient.delete(url)
            .catch(error => {
                console.error(`Error force deleting course with ID ${courseId}:`, error);
                throw error;
            });
    },

    // Tìm kiếm lớp học theo tên
    searchByName(courseName) {
        const url = `/course/searchByName?courseName=${encodeURIComponent(courseName)}`;
        return axiosClient.get(url)
            .catch(error => {
                console.error(`Error searching courses by name "${courseName}":`, error);
                throw error;
            });
    },
};

export default courseApi;
