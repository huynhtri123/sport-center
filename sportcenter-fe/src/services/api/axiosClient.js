import axios from 'axios';
import { toast } from 'react-toastify';

import authApi from './authApi';
import { handleLocalStorage } from '../../utils/handleLocalStorage';

const axiosClient = axios.create({
    baseURL: `${process.env.REACT_APP_SERVER_URI}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Interceptors
// Add a request interceptor
axiosClient.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

// Biến lưu trữ trạng thái refresh token
let isRefreshing = false; // cờ lưu trạng thái có yêu cầu refreshToken nào đang chạy ko
let refreshSubscribers = []; // danh sách các hàm đợi refreshToken xong mới thực hiện tiếp

// Hàm gọi các yêu cầu trong hàng đợi sau khi có token mới
function onRefreshed(token) {
    refreshSubscribers.forEach((callback) => {
        callback(token);
    });
    refreshSubscribers = [];
}

// Hàm thêm các yêu cầu bị chặn vào hàng đợi
function addSubscriber(callback) {
    refreshSubscribers.push(callback);
}

// Hàm để refresh token
async function execRefreshToken() {
    return authApi.refreshToken();
}

// Add a response interceptor
axiosClient.interceptors.response.use(
    function (response) {
        return response.data;
    },
    async function (error) {
        const originalRequest = error.config;

        if (error.response) {
            const { status, data } = error.response;
            // console.log(status, data);

            // Xử lý lỗi 401 (Unauthorized)
            if (status === 401 && !originalRequest._retry) {
                originalRequest._retry = true; // Đánh dấu là đã thử lại một lần
                // Nếu chưa có yêu cầu làm mới token nào đang chạy
                if (!isRefreshing) {
                    isRefreshing = true;
                    try {
                        const response = await execRefreshToken();
                        const newToken = response.data.token;
                        isRefreshing = false;
                        // Gọi lại tất cả các yêu cầu đang chờ với token mới
                        onRefreshed(newToken);

                        // Thử gửi lại yêu cầu ban đầu với token mới
                        console.info('Vừa refresh token thành công.');
                        return axiosClient(originalRequest);
                    } catch (refreshError) {
                        console.error('Refresh token failed: ', refreshError);
                        // đánh dấu là chưa có yêu cầu refreshToken nào đang chạy
                        isRefreshing = false;

                        // Xóa tất cả các yêu cầu trong hàng đợi
                        refreshSubscribers = [];
                        handleLocalStorage.clearToken();
                        redirectToLogin();
                        return Promise.reject(refreshError);
                    }
                }

                // Nếu đang trong quá trình làm mới token, thêm yêu cầu vào hàng đợi
                return new Promise((resolve) => {
                    addSubscriber(() => {
                        resolve(axiosClient(originalRequest));
                    });
                });
            }

            // Sử dụng error.response.status để xử lý các lỗi khác
            switch (status) {
                case 403: // Forbidden
                    console.warn('Access Denied: ', data.message);
                    toast.error('You do not have permission to access this resource.');
                    break;

                default: // các lỗi khác
                    console.log(data.message || 'An error occurred, please try again later.');
                    toast.error(data.message || 'An error occurred, please try again later.');
            }
        } else if (error.request) {
            // Xử lý lỗi mạng hoặc không phản hồi từ server
            console.error('No response received from server: ', error.request);
            toast.error('Unable to connect to the server. Please check your network connection!');
        } else {
            console.error('Error setting up request: ', error.message);
            toast.error('Error setting up request: ', error.message);
        }

        return Promise.reject(error);
    }
);

function redirectToLogin() {
    // window.location.href = '/#/sign-in'; // chuyển hướng đến trang đăng nhập
    const basePath = window.location.pathname.split('/')[1]; // Lấy basePath từ URL
    window.location.href = `/${basePath}/#/sign-in`;
}

export default axiosClient;
