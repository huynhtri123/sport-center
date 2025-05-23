/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Pagination } from 'antd';
import styles from '../../../assets/css/Admin/manage/manageSports.module.scss';
import sportApi from '../../../services/api/sport/sportApi';
import fileApi from '../../../services/api/file/fileApi';
import { Loading } from '../../../components/Loading/Loading';
import ConfirmModal from '../../../components/Modal/ConfirmModal';

function ManageSports() {
    const [sports, setSports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteSportId, setDeleteSportId] = useState(null);
    const [formData, setFormData] = useState({
        sportName: '',
        description: '',
    });
    const [editingSport, setEditingSport] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showInputForm, setShowInputForm] = useState(false);

    const [sortOrder, setSortOrder] = useState('asc'); // Mặc định sắp xếp tăng dần

    const [selectedFile, setSelectedFile] = useState(null); // State lưu file đã chọn
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleSortByName = () => {
        const sortedSports = [...filteredSports].sort((a, b) => {
            return sortOrder === 'asc'
                ? a.sportName.localeCompare(b.sportName)
                : b.sportName.localeCompare(a.sportName);
        });
        setSports(sortedSports);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Đảo ngược trạng thái sắp xếp
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [totalItems, setTotalItems] = useState(0);

    const fetchSports = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await sportApi.getAllActive(currentPage - 1, pageSize);
            setSports(response.data.content);
            setTotalItems(response.data.totalElements);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchSports();
    }, [fetchSports]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const toggleModalOpen = (sportId = null) => {
        setDeleteSportId(sportId);
        setIsModalOpen(!isModalOpen);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (isEditing) {
            setEditingSport((prevData) => ({ ...prevData, [name]: value }));
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }
    };

    const handleChangeFile = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); // Lưu file đã chọn vào state
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!formData.sportName || !formData.description || !selectedFile) {
            toast.warn('Please fill in all fields including the image.');
            return;
        }

        try {
            setIsLoading(true);
            let imageUrl = '';

            // Nếu có file được chọn -> upload
            if (selectedFile) {
                const response = await fileApi.uploadImage(selectedFile);
                imageUrl = response.data.url;
            }

            const createResponse = await sportApi.create({
                ...formData,
                imageUrl, // Thêm URL ảnh sau khi upload
            });

            toast.success(createResponse.message);
            fetchSports();
            resetFormData();
        } catch (err) {
            console.error(err);
            toast.error('Failed to create sport');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingSport.sportName || !editingSport.description) {
            toast.warn('Please fill in all fields.');
            return;
        }

        try {
            setIsLoading(true);
            let imageUrl = editingSport.imageUrl;

            // Nếu có file được chọn -> upload
            if (selectedFile) {
                const response = await fileApi.uploadImage(selectedFile);
                imageUrl = response.data.url;
            }

            const editResponse = await sportApi.update(editingSport.id, {
                ...editingSport,
                imageUrl, // Thêm URL ảnh sau khi upload
            });

            toast.success(editResponse.message);
            fetchSports();
            setIsEditing(false);
            setEditingSport(null);
            resetFormData();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update sport');
        } finally {
            setIsLoading(false);
        }
    };

    const resetFormData = () => {
        setFormData({
            sportName: '',
            description: '',
        });
        setSelectedFile(null); // Reset file đã chọn
        setPreviewUrl(null); // Reset ảnh xem trước
        setShowInputForm(false);
    };

    const handleToggleShowAddSport = () => {
        setShowInputForm(!showInputForm);
        if (isEditing) {
            setIsEditing(false);
            setEditingSport(null);
            resetFormData();
        }
    };

    const handleSoftDelete = async () => {
        if (!deleteSportId) return;
        try {
            setIsLoading(true);
            const deleteResponse = await sportApi.softDelete(deleteSportId);
            toast.success(deleteResponse.message);
            fetchSports();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsModalOpen(false);
        }
    };

    const handleEditClick = (sport) => {
        setIsEditing(true);
        setEditingSport(sport);
        setShowInputForm(true);
        setPreviewUrl(sport.imageUrl || null);
    };

    const filteredSports = sports.filter((sport) => sport.sportName.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className={styles.manageSports}>
            {isLoading && <Loading />}

            <div className={styles.searchContainer}>
                <input
                    type='text'
                    placeholder='Search by sport name...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <button className={`btn ${styles.addButton}`} onClick={handleToggleShowAddSport}>
                {isEditing ? 'Cancel Edit' : 'Create New Sport'}
            </button>

            {(showInputForm || isEditing) && (
                <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit} className={styles.inputForm}>
                    <div className={styles.formContainer}>
                        <input
                            type='text'
                            name='sportName'
                            placeholder='Sport Name'
                            value={isEditing ? editingSport.sportName : formData.sportName}
                            onChange={handleChange}
                        />
                        <input
                            type='text'
                            name='description'
                            placeholder='Description'
                            value={isEditing ? editingSport.description : formData.description}
                            onChange={handleChange}
                        />
                        <div className='fileInputContainer'>
                            <label className='fileLabel'>
                                Choose File
                                <input type='file' className='fileInput' onChange={handleChangeFile} />
                            </label>
                            <span className='fileName'>
                                {selectedFile ? selectedFile.name : 'No file chosen'}
                                {previewUrl && (
                                    <div className={styles.previewImageWrapper}>
                                        <img src={previewUrl} alt='Preview' className={styles.previewImage} />
                                    </div>
                                )}
                            </span>
                        </div>
                        <button type='submit' className={`btn ${styles.editButton}`}>
                            {isEditing ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            )}

            <table className={`mt-4 ${styles.sportsTable}`}>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th onClick={handleSortByName} style={{ cursor: 'pointer' }}>
                            Name
                            {sortOrder === 'asc' ? (
                                <i className='fa-solid fa-arrow-up-short-wide ms-2'></i>
                            ) : (
                                <i className='fa-solid fa-arrow-down-short-wide ms-2'></i>
                            )}
                        </th>
                        <th>Description</th>
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredSports.length > 0 ? (
                        filteredSports.map((sport, index) => (
                            <tr key={sport.id}>
                                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                <td>{sport.sportName}</td>
                                <td>{sport.description}</td>
                                <td>
                                    <img src={sport.imageUrl} alt={sport.sportName} className={styles.sportImage} />
                                </td>
                                <td>
                                    <button
                                        className={`btn ${styles.editButton}`}
                                        onClick={() => handleEditClick(sport)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={`btn ${styles.deleteButton}`}
                                        onClick={() => toggleModalOpen(sport.id)}
                                    >
                                        Delete
                                    </button>
                                    {isModalOpen && deleteSportId === sport.id && (
                                        <ConfirmModal
                                            title='Are you sure to delete this sport?'
                                            isOpen={isModalOpen}
                                            onClose={() => toggleModalOpen(null)}
                                            onSubmit={handleSoftDelete}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan='5'>No sports available.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalItems}
                onChange={handlePageChange}
                className={styles.pagination}
            />
        </div>
    );
}

export default ManageSports;
