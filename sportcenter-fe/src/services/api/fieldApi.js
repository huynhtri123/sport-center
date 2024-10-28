import axiosClient from './axiosClient';

const fieldApi = {
    // Tạo mới một sân
    create(fieldRequest) {
        const url = '/field/create';
        return axiosClient.post(url, fieldRequest);
    },

    // Lấy tất cả các sân đang hoạt động (active & not deleted)
    getAllActive() {
        const url = '/field/getAllActive';
        return axiosClient.get(url);
    },

    // Lấy thông tin sân theo ID
    getById(fieldId) {
        const url = `/field/getById/${fieldId}`;
        return axiosClient.get(url);
    },

    // Lấy danh sách tất cả các sân đã xóa mềm
    getAllSoftDeleted() {
        const url = '/field/getAllSoftDeleted';
        return axiosClient.get(url);
    },

    // Cập nhật thông tin sân theo ID
    update(fieldId, fieldRequest) {
        const url = `/field/update/${fieldId}`;
        return axiosClient.put(url, fieldRequest);
    },

    // Chuyển đổi trạng thái hoạt động của sân
    toggleActiveStatus(fieldId) {
        const url = `/field/toggleActiveStatus/${fieldId}`;
        return axiosClient.patch(url);
    },

    // Xóa mềm sân theo ID
    softDelete(fieldId) {
        const url = `/field/softDelete/${fieldId}`;
        return axiosClient.patch(url);
    },

    // Khôi phục sân đã bị xóa mềm theo ID
    restore(fieldId) {
        const url = `/field/restore/${fieldId}`;
        return axiosClient.patch(url);
    },

    // Xóa sân theo ID
    forceDelete(fieldId) {
        const url = `/field/forceDelete/${fieldId}`;
        return axiosClient.delete(url);
    },

    // Tìm kiếm sân theo tên
    searchByName(fieldName) {
        const url = `/field/searchByName?fieldName=${fieldName}`;
        return axiosClient.get(url);
    },

    // Tìm kiếm sân theo loại
    findByType(fieldType) {
        const url = `/field/findByType?type=${fieldType}`;
        return axiosClient.get(url);
    }
};

export default fieldApi;
