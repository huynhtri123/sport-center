import axiosClient from './axiosClient';

const lessonApi = {
    // Tạo mới một buổi học
    create(lessonRequest) {
        const url = '/lesson/create';
        return axiosClient.post(url, lessonRequest);
    },

    // Lấy tất cả các buổi học đang hoạt động (active & not deleted)
    getAllActive() {
        const url = '/lesson/all-active';
        return axiosClient.get(url);
    },

    // Lấy thông tin buổi học theo ID
    getById(lessonId) {
        const url = `/lesson/${lessonId}`;
        return axiosClient.get(url);
    },

    // Lấy danh sách tất cả các buổi học đã xóa mềm
    getAllSoftDeleted() {
        const url = '/lesson/getAllSoftDeleted';
        return axiosClient.get(url);
    },

    // Cập nhật thông tin buổi học theo ID
    update(lessonId, lessonRequest) {
        const url = `/lesson/update/${lessonId}`;
        return axiosClient.put(url, lessonRequest);
    },

    // Chuyển đổi trạng thái hoạt động của buổi học
    toggleActiveStatus(lessonId) {
        const url = `/lesson/toggleActiveStatus/${lessonId}`;
        return axiosClient.patch(url);
    },

    // Xóa mềm buổi học theo ID
    softDelete(lessonId) {
        const url = `/lesson/soft-delete/${lessonId}`;
        return axiosClient.patch(url);
    },

    // Khôi phục buổi học đã bị xóa mềm theo ID
    restore(lessonId) {
        const url = `/lesson/restore/${lessonId}`;
        return axiosClient.patch(url);
    },

    // Xóa vĩnh viễn buổi học theo ID
    forceDelete(lessonId) {
        const url = `/lesson/forceDelete/${lessonId}`;
        return axiosClient.delete(url);
    },

    // Tìm kiếm buổi học theo tên
    searchByName(lessonName) {
        const url = `/lesson/search-by-name?lessonName=${lessonName}`;
        return axiosClient.get(url);
    },
};

export default lessonApi;
