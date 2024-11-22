import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../assets/css/Admin/manageSports.module.scss';
import sportApi from '../../services/api/sportApi';
import { Loading } from '../../components/Loading/Loading';
import ConfirmModal from '../../components/Modal/ConfirmModal';

function ManageSports() {
    const [sports, setSports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteSportId, setDeleteSportId] = useState(null);
    const [formData, setFormData] = useState({
        sportName: '',
        description: '',
        imageUrl: '',
    });
    const [editingSport, setEditingSport] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showInputForm, setShowInputForm] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5); // Set page size to 5
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

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

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const createResponse = await sportApi.create(formData);
            toast.success(createResponse.message);
            fetchSports(); // Refresh the sports list
            resetFormData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const editResponse = await sportApi.update(editingSport.id, editingSport);
            toast.success(editResponse.message);
            fetchSports(); // Refresh the sports list
            setIsEditing(false);
            setEditingSport(null);
            resetFormData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const resetFormData = () => {
        setFormData({
            sportName: '',
            description: '',
            imageUrl: '',
        });
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

    const fetchSports = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await sportApi.getAllActive(currentPage, pageSize);
            setSports(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        fetchSports();
    }, [fetchSports]);

    const handleSoftDelete = async () => {
        if (!deleteSportId) return;
        try {
            setIsLoading(true);
            const deleteResponse = await sportApi.softDelete(deleteSportId);
            toast.success(deleteResponse.message);
            fetchSports(); // Refresh the sports list
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
    };

    const filteredSports = sports.filter(sport =>
        sport.sportName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.manageSports}>
            {isLoading && <Loading />}
            <button className={`btn ${styles.addButton}`} onClick={handleToggleShowAddSport}>
                {isEditing ? 'Hủy chỉnh sửa' : 'Thêm môn thể thao mới'}
            </button>

            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên môn thể thao..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {(showInputForm || isEditing) && (
                <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit} className={styles.inputForm}>
                    <div className={styles.formContainer}>
                        <input
                            type='text'
                            name='sportName'
                            placeholder='Tên Môn Thể Thao'
                            value={isEditing ? editingSport.sportName : formData.sportName}
                            onChange={handleChange}
                        />
                        <input
                            type='text'
                            name='description'
                            placeholder='Mô Tả'
                            value={isEditing ? editingSport.description : formData.description}
                            onChange={handleChange}
                        />
                        <input
                            type='text'
                            name='imageUrl'
                            placeholder='URL Ảnh'
                            value={isEditing ? editingSport.imageUrl : formData.imageUrl}
                            onChange={handleChange}
                        />
                        <button type="submit" className={`btn ${styles.addButton}`}>
                            {isEditing ? 'Cập nhật môn thể thao' : 'Thêm môn thể thao'}
                        </button>
                    </div>
                </form>
            )}

            <table className={`mt-4 ${styles.sportsTable}`}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên Môn Thể Thao</th>
                        <th>Mô Tả</th>
                        <th>Ảnh</th>
                        <th>Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSports.length > 0 ? (
                        filteredSports.map((sport, index) => (
                            <tr key={sport.id}>
                                <td>{index + 1 + currentPage * pageSize}</td>
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
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        className={`btn ${styles.deleteButton}`}
                                        onClick={() => toggleModalOpen(sport.id)}
                                    >
                                        Xóa
                                    </button>
                                    {isModalOpen && deleteSportId === sport.id && (
                                        <ConfirmModal
                                            title='Bạn có chắc chắn muốn xóa môn thể thao này không?'
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
                            <td colSpan='5'>Không có môn thể thao nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className={styles.pagination}>
                <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    Previous
                </button>
                <span>{`Page ${currentPage + 1} of ${totalPages}`}</span>
                <button
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default ManageSports;