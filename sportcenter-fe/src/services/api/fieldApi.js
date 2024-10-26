import axiosClient from './axiosClient';

const fieldApi = {
    async findByType(type) {
        const url = `/field/findByType?type=${type}`;
        try {
            const response = await axiosClient.get(url);
            return response;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return {
                    data: null,
                    message: 'Không tìm thấy loại sân yêu cầu.',
                    status: 404,
                };
            }
            // Ném lỗi lại nếu không phải là 404 để xử lý tiếp ở nơi khác
            throw error;
        }
    },
    findById(fieldId) {
        const url = `/field/getById/${fieldId}`;
        return axiosClient.get(url);
    },
};

export default fieldApi;
