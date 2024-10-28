import axiosClient from './axiosClient';

const playerApi = {
    // Tạo mới một cầu thủ
    create(playerRequest) {
        const url = '/player/create';
        return axiosClient.post(url, playerRequest);
    },

    // Lấy thông tin cầu thủ theo ID
    getById(playerId) {
        const url = `/player/getById/${playerId}`;
        return axiosClient.get(url);
    },

    // Cập nhật thông tin cầu thủ theo ID
    update(playerId, playerRequest) {
        const url = `/player/update/${playerId}`;
        return axiosClient.put(url, playerRequest);
    },

    // Xóa mềm cầu thủ theo ID
    softDelete(playerId) {
        const url = `/player/softDelete/${playerId}`;
        return axiosClient.patch(url);
    },

    // Lấy danh sách tất cả các cầu thủ
    getAllPlayers() {
        const url = '/player/getAll';
        return axiosClient.get(url);
    },

    // Khôi phục cầu thủ đã bị xóa mềm theo ID
    restore(playerId) {
        const url = `/player/restore/${playerId}`;
        return axiosClient.patch(url);
    }
};

export default playerApi;
