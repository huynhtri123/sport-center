import React, { useState, useEffect } from 'react';
import userApi from '../../services/api/userApi';
import styles from '../../assets/css/Admin/manageUsers.module.scss';
import { toast } from 'react-toastify';
import { Loading } from '../../components/Loading/Loading';

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false); // Thêm trạng thái loading
    const pageSize = 10;

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    async function fetchUsers(page) {
        setLoading(true); // Bắt đầu loading
        try {
            const response = await userApi.getAllActive(page - 1, pageSize);
            if (response.data) {
                setUsers(response.data.content || []);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            toast.error('Failed to fetch users. Please try again.');
        } finally {
            setLoading(false); // Kết thúc loading
        }
    }

    const handleDeleteUser = async (userId) => {
        setLoading(true); // Bắt đầu loading khi xóa
        try {
            await userApi.softDelete(userId);
            fetchUsers(currentPage);
            toast.success('User deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete user. Please try again.');
        } finally {
            setLoading(false); // Kết thúc loading
        }
    };

    return (
        <div className={styles.manageUsers}>
            {/* <h2>Manage Users</h21> */}
            {loading ? (
                <Loading /> // Hiển thị component Loading khi đang tải
            ) : users.length > 0 ? (
                <>
                    <table className={styles.usersTable}>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Phone Number</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={user.id}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phoneNumber}</td>
                                    <td>{user.address}</td>
                                    <td>
                                        <button
                                            className={`btn ${styles.deleteButton}`}
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className={styles.pagination}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <p>No users available.</p>
            )}
        </div>
    );
}

export default ManageUsers;
