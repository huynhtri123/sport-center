import { Client } from '@stomp/stompjs'; // STOMP client để giao tiếp qua WebSocket
import SockJS from 'sockjs-client'; // SockJS để tạo kết nối WebSocket

const SOCKET_URL = process.env.REACT_APP_SERVER_URI + '/ws'; // URL WebSocket endpoint

let stompClient = null; // Biến lưu trữ STOMP client

// Hàm kết nối WebSocket và lắng nghe cập nhật từ server
export const connectWebSocket = (onBookingUpdate, onNotificationUpdate) => {
    const socket = new SockJS(SOCKET_URL); // Tạo kết nối SockJS tới endpoint WebSocket

    stompClient = new Client({
        webSocketFactory: () => socket, // Sử dụng SockJS cho kết nối WebSocket
        // debug: (str) => console.log(str), // Ghi log debug (tuỳ chọn)
        onConnect: () => {
            console.log('✅ Connected to WebSocket');

            // Đăng ký lắng nghe trên kênh "/topic/booking-updates"
            stompClient.subscribe('/topic/booking-updates', (message) => {
                // message từ BE
                console.log('📢 Dữ liệu nhận được từ BE:', message);
                // Chuyển message.body (JSON) thành object
                const updatedBooking = JSON.parse(message.body);

                // Gọi callback onBookingUpdate với dữ liệu nhận được
                onBookingUpdate(updatedBooking);
            });

            // Lắng nghe cập nhật notification
            stompClient.subscribe('/topic/notification-updates', (message) => {
                console.log('🔔 Notification Update:', message);
                const updatedNotification = JSON.parse(message.body);
                onNotificationUpdate(updatedNotification);
            });
        },
        onStompError: (error) => {
            console.error('❌ WebSocket Error:', error);
        },
    });

    stompClient.activate(); // Kích hoạt kết nối WebSocket
};

// Hàm ngắt kết nối WebSocket khi không cần nữa
export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
        console.log('🔌 WebSocket connection closed.');
    }
};
