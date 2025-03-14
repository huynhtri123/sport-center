import axiosClient from '../axiosClient';

const fieldApi = {
    // Tạo mới một sân
    create(fieldRequest) {
        const url = '/field/create';
        return axiosClient.post(url, fieldRequest);
    },

    // Lấy tất cả các sân đang hoạt động (active & not deleted)
    getAllActive(page = 0, size = 3) {
        const url = `/public/field/all-active?page=${page}&size=${size}`;
        return axiosClient.get(url);
    },

    // Lấy thông tin sân theo ID
    getById(fieldId) {
        const url = `/public/field/${fieldId}`;
        return axiosClient.get(url);
    },

    // Lấy danh sách tất cả các sân đã xóa mềm
    getAllSoftDeleted() {
        const url = '/field/soft-deleted';
        return axiosClient.get(url);
    },

    // Cập nhật thông tin sân theo ID
    update(fieldId, fieldRequest) {
        const url = `/field/update/${fieldId}`;
        return axiosClient.put(url, fieldRequest);
    },

    // Chuyển đổi trạng thái hoạt động của sân
    toggleActiveStatus(fieldId) {
        const url = `/field/toggle-active-status/${fieldId}`;
        return axiosClient.patch(url);
    },

    // Xóa mềm sân theo ID
    softDelete(fieldId) {
        const url = `/field/soft-delete/${fieldId}`;
        return axiosClient.patch(url);
    },

    // Khôi phục sân đã bị xóa mềm theo ID
    restore(fieldId) {
        const url = `/field/restore/${fieldId}`;
        return axiosClient.patch(url);
    },

    // Xóa sân theo ID
    forceDelete(fieldId) {
        const url = `/field/force-delete/${fieldId}`;
        return axiosClient.delete(url);
    },

    // Tìm kiếm sân theo tên
    searchByName(fieldName) {
        const url = `/public/field/search-by-name?fieldName=${fieldName}`;
        return axiosClient.get(url);
    },
    // Tìm kiếm sân theo tên và phân trang
    searchByNameAndPaginate(fieldName, page, size) {
        const url = `/public/field/search-by-name-paginate?fieldName=${fieldName}&page=${page}&size=${size}`;
        return axiosClient.get(url);
    },

    findBySportId(sportId) {
        const url = `/public/field/sport/${sportId}`;
        return axiosClient.get(url);
    },

    findById(fieldId) {
        const url = `/public/field/${fieldId}`;
        return axiosClient.get(url);
    },
};

export default fieldApi;
