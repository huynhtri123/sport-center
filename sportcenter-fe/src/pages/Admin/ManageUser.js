import React, { useState, useEffect } from 'react';
import userApi from '../../services/api/userApi';
import styles from '../../assets/css/Admin/manageUsers.module.scss';
import { toast } from 'react-toastify';

function ManageUsers() {
    const [users, setUsers] = useState([]); // Initialize as an empty array
    const [editingUser, setEditingUser] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false); // State for form visibility

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            const response = await userApi.getAllActive();
            setUsers(response.data || []); // Ensure data is an array even if null
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to fetch users. Please try again.');
        }
    }

    const handleEditUser = (user) => {
        setEditingUser(user);
        setIsFormVisible(true); // Show form when editing
    };

    const handleUpdateUser = async () => {
        try {
            const response = await userApi.update(editingUser.id, editingUser);
            setUsers(users.map((user) => (user.id === editingUser.id ? response.data : user)));
            toast.success('User updated successfully!');
            setEditingUser(null);
            setIsFormVisible(false); // Hide form after updating
        } catch (error) {
            console.error('Failed to update user:', error.response ? error.response.data : error.message);
            toast.error('Failed to update user. Please try again.');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await userApi.softDelete(userId);
            setUsers(users.filter((user) => user.id !== userId));
            toast.success('User deleted successfully!');
        } catch (error) {
            console.error('Failed to delete user:', error.response || error);
            toast.error('Failed to delete user. Please try again.');
        }
    };

    return (
        <div className={styles.manageUsers}>
            <h2>Manage Users</h2>
            {users && users.length > 0 ? ( // Check if users have data
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
                                <td>{index + 1}</td>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>{user.phoneNumber}</td>
                                <td>{user.address}</td>
                                <td>
                                    <button
                                        className={`btn ${styles.editButton}`}
                                        onClick={() => handleEditUser(user)}
                                    >
                                        Edit
                                    </button>
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
            ) : (
                <p>No users available.</p>
            )}

            {isFormVisible && ( // Conditional rendering of the form
                <div className={styles.formContainer}>
                    <h3>Edit User</h3>
                    <input
                        type='text'
                        placeholder='Full Name'
                        value={editingUser ? editingUser.fullName : ''}
                        onChange={(e) =>
                            setEditingUser({ ...editingUser, fullName: e.target.value })
                        }
                    />
                    <input
                        type='email'
                        placeholder='Email'
                        value={editingUser ? editingUser.email : ''}
                        onChange={(e) =>
                            setEditingUser({ ...editingUser, email: e.target.value })
                        }
                    />
                    <input
                        type='text'
                        placeholder='Phone Number'
                        value={editingUser ? editingUser.phoneNumber : ''}
                        onChange={(e) =>
                            setEditingUser({ ...editingUser, phoneNumber: e.target.value })
                        }
                    />
                    <input
                        type='text'
                        placeholder='Address'
                        value={editingUser ? editingUser.address : ''}
                        onChange={(e) =>
                            setEditingUser({ ...editingUser, address: e.target.value })
                        }
                    />
                    <button
                        className={`btn ${styles.addButton}`}
                        onClick={handleUpdateUser}
                    >
                        Update User
                    </button>
                    <button className='btn' onClick={() => setEditingUser(null)}>
                        Cancel Edit
                    </button>
                </div>
            )}
        </div>
    );
}

export default ManageUsers;