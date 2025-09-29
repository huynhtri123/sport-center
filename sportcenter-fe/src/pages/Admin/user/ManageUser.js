import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Modal } from 'antd';
import { Loading } from '../../../components/Loading/Loading';
import userApi from '../../../services/api/user/userApi';
import styles from '../../../assets/css/Admin/manage/manageUsers.module.scss';

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState(null); // Lưu ID user cần xóa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [restoreUserId, setRestoreUserId] = useState(null); // ID user cần unblock
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false); // Modal unblock

    const pageSize = 5;

    useEffect(() => {
        if (searchTerm === '') {
            fetchUsers(currentPage);
        } else {
            searchUsersByName(searchTerm, currentPage);
        }
    }, [currentPage, searchTerm]);

    async function fetchUsers(page) {
        setLoading(true);
        try {
            const response = await userApi.getAll(page - 1, pageSize);
            if (response.data) {
                setUsers(response.data.content || []);
                setFilteredUsers(response.data.content || []);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            toast.error('Failed to fetch users. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function searchUsersByName(name, page) {
        // setLoading(true);
        try {
            const response = await userApi.getUsersByName(name, page - 1, pageSize);
            if (response.data) {
                setUsers(response.data.content || []);
                setFilteredUsers(response.data.content || []);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            toast.error('Failed to search users. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        const filtered = users.filter(
            (user) => user.fullName.toLowerCase().includes(value.toLowerCase()) // Chuyển fullName thành chữ thường để so sánh
        );
        setFilteredUsers(filtered);
    };

    // Hiển thị modal xác nhận trước khi xóa
    const showDeleteConfirm = (userId) => {
        setDeleteUserId(userId);
        setIsModalOpen(true);
    };

    // Xử lý xóa user khi xác nhận trong modal
    const handleDeleteUser = async () => {
        if (!deleteUserId) return;
        setLoading(true);
        try {
            await userApi.softDelete(deleteUserId);
            fetchUsers(currentPage);
            toast.success('User deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete user. Please try again.');
        } finally {
            setLoading(false);
            setIsModalOpen(false);
            setDeleteUserId(null);
        }
    };

    const showRestoreConfirm = (userId) => {
        setRestoreUserId(userId);
        setIsRestoreModalOpen(true);
    };

    const handleRestoreUser = async () => {
        if (!restoreUserId) return;
        setLoading(true);
        try {
            await userApi.restore(restoreUserId);
            fetchUsers(currentPage);
            toast.success('User unblocked successfully!');
        } catch (error) {
            toast.error('Failed to unblock user. Please try again.');
        } finally {
            setLoading(false);
            setIsRestoreModalOpen(false);
            setRestoreUserId(null);
        }
    };

    return (
        <div className={styles.manageUsers}>
            <div className={styles.searchContainer}>
                <input
                    type='text'
                    placeholder='Search by name...'
                    value={searchTerm}
                    onChange={handleSearch}
                    className={styles.searchInput}
                />
            </div>

            {loading ? (
                <Loading />
            ) : filteredUsers.length > 0 ? (
                <>
                    <table className={styles.usersTable}>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Phone Number</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => (
                                <tr key={user.id}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phoneNumber}</td>
                                    <td>{user.address}</td>
                                    <td>
                                        {user.isDeleted ? (
                                            <span className={styles.blocked}>Blocked</span>
                                        ) : (
                                            <span className={styles.active}>Active</span>
                                        )}
                                    </td>
                                    <td>
                                        {user.isDeleted ? (
                                            <button
                                                className={styles.restoreButton}
                                                onClick={() => showRestoreConfirm(user.id)}
                                            >
                                                Unblock
                                            </button>
                                        ) : (
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => showDeleteConfirm(user.id)}
                                            >
                                                Block
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className={styles.pagination}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        >
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <p>No users found.</p>
            )}

            {/* Modal xác nhận xóa */}
            <Modal
                title='Confirm Block'
                open={isModalOpen}
                onOk={handleDeleteUser}
                onCancel={() => setIsModalOpen(false)}
                okText='Yes, Block'
                cancelText='Cancel'
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to block this user?</p>
            </Modal>
            {/* Modal xác nhận khôi phục */}
            <Modal
                title='Confirm Unblock'
                open={isRestoreModalOpen}
                onOk={handleRestoreUser}
                onCancel={() => setIsRestoreModalOpen(false)}
                okText='Yes, Unblock'
                cancelText='Cancel'
                okButtonProps={{ style: { backgroundColor: '#28a745', borderColor: '#28a745' } }}
            >
                <p>Are you sure you want to unblock this user?</p>
            </Modal>
        </div>
    );
}

export default ManageUsers;
