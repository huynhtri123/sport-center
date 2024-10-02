import axios from "axios";
import authApi from "./authApi";
import { handleLocalStorage } from "../../utils/handleLocalStorage";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptors
// Add a request interceptor
axiosClient.interceptors.request.use(
    function (config) {
        // Do something before request is sent
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

// Biến lưu trữ trạng thái refresh token
let isRefreshing = false;
let refreshSubscribers = [];

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
    const refreshToken = localStorage.getItem("refreshToken");
    // console.log("localsotrage", refreshToken);
    return authApi.refreshToken({ token: refreshToken });
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

            // Xử lý lỗi 401 (Unauthorized)
            if (status === 401 && !originalRequest._retry) {
                originalRequest._retry = true; // Đánh dấu là đã thử lại một lần

                const refreshToken = localStorage.getItem("refreshToken");

                // Kiểm tra nếu có refresh token
                if (refreshToken) {
                    if (!isRefreshing) {
                        // Nếu chưa có yêu cầu làm mới token nào đang chạy
                        isRefreshing = true;

                        try {
                            localStorage.removeItem("token");
                            const response = await execRefreshToken();
                            // console.log(response);
                            const newToken = response.Data.token;
                            // console.log(newToken);

                            // Lưu token mới vào localStorage
                            localStorage.setItem("token", newToken);

                            // Đánh dấu việc làm mới token đã xong
                            isRefreshing = false;

                            // Gọi lại tất cả các yêu cầu đang chờ với token mới
                            onRefreshed(newToken);

                            // Thử gửi lại yêu cầu ban đầu với token mới
                            originalRequest.headers[
                                "Authorization"
                            ] = `Bearer ${newToken}`;
                            console.warn("Vừa refresh token thành công.");
                            return axiosClient(originalRequest);
                        } catch (refreshError) {
                            // Nếu làm mới token thất bại, xóa token và yêu cầu đăng nhập lại
                            console.error(
                                "Refresh token failed: ",
                                refreshError
                            );
                            alert(
                                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                            );
                            handleLocalStorage.clearToken();
                            return Promise.reject(refreshError);
                        }
                    }

                    // Nếu đang trong quá trình làm mới token, thêm yêu cầu vào hàng đợi
                    return new Promise((resolve) => {
                        addSubscriber((newToken) => {
                            originalRequest.headers[
                                "Authorization"
                            ] = `Bearer ${newToken}`;
                            resolve(axiosClient(originalRequest));
                        });
                    });
                } else {
                    // Không có refresh token => yêu cầu đăng nhập lại
                    alert(
                        "Thông tin đăng nhập không chính xác. Vui lòng đăng nhập lại."
                    );
                    handleLocalStorage.clearToken();
                }
            }

            switch (status) {
                case 403: // Forbidden
                    console.warn("Access Denied: ", data.Message);
                    alert("Bạn không có quyền truy cập tài nguyên này.");
                    break;

                default:
                    console.error("Error from server: ", data.Message || data);
                    alert(
                        data.message || "Đã xảy ra lỗi, vui lòng thử lại sau."
                    );
            }
        } else if (error.request) {
            // Xử lý lỗi mạng hoặc không phản hồi từ server
            console.error("No response received from server: ", error.request);
            alert(
                "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!"
            );
        } else {
            console.error("Error setting up request: ", error.Message);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
