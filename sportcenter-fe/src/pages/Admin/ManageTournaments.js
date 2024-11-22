import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../assets/css/Admin/manageTournaments.module.scss';
import tournamentApi from '../../services/api/tournamentApi';
import { Loading } from '../../components/Loading/Loading';
import ConfirmModal from '../../components/Modal/ConfirmModal';

function ManageTournaments() {
    const [tournaments, setTournaments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteTournamentId, setDeleteTournamentId] = useState(null);
    const [formData, setFormData] = useState({
        tournamentName: '',
        sportId: '',
        startDate: '',
        endDate: '',
        maxTeams: '',
        registrationDeadline: '',
        prizes: [],
        thumUrl: '',
    });
    const [editTournamentId, setEditTournamentId] = useState(null);
    const [editFormData, setEditFormData] = useState(formData);
    const [isEditing, setIsEditing] = useState(false);
    const [showInputForm, setShowInputForm] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5); // Set page size to 5
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const toggleModalOpen = (tournamentId = null) => {
        setDeleteTournamentId(tournamentId);
        setIsModalOpen(!isModalOpen);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startDate' || name === 'endDate' || name === 'registrationDeadline') {
            const isoDate = new Date(value).toISOString();
            if (isEditing) {
                setEditFormData((prevData) => ({ ...prevData, [name]: isoDate }));
            } else {
                setFormData((prevData) => ({ ...prevData, [name]: isoDate }));
            }
        } else {
            if (isEditing) {
                setEditFormData((prevData) => ({ ...prevData, [name]: value }));
            } else {
                setFormData((prevData) => ({ ...prevData, [name]: value }));
            }
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const createResponse = await tournamentApi.create(formData);
            toast.success(createResponse.message);
            getTournaments();
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
            const editResponse = await tournamentApi.update(editTournamentId, editFormData);
            toast.success(editResponse.message);
            getTournaments();
            setIsEditing(false);
            setEditTournamentId(null);
            resetFormData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const resetFormData = () => {
        setFormData({
            tournamentName: '',
            sportId: '',
            startDate: '',
            endDate: '',
            maxTeams: '',
            registrationDeadline: '',
            prizes: [],
            thumUrl: '',
        });
        setShowInputForm(false);
    };

    const handleToggleShowAddTournament = () => {
        setShowInputForm(!showInputForm);
        if (isEditing) {
            setIsEditing(false);
            setEditTournamentId(null);
            resetFormData();
        }
    };

    const getTournaments = useCallback(async () => {
        try {
            const response = await tournamentApi.getAllActive(currentPage, pageSize);
            setTournaments(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            console.error(err);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        getTournaments();
    }, [getTournaments, currentPage, pageSize]);

    const handleSoftDelete = async () => {
        if (!deleteTournamentId) return;
        try {
            setIsLoading(true);
            const deleteResponse = await tournamentApi.softDelete(deleteTournamentId);
            toast.success(deleteResponse.message);
            getTournaments();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsModalOpen(false);
        }
    };

    const handleEditClick = (tournament) => {
        setIsEditing(true);
        setEditTournamentId(tournament.id);
        setEditFormData({
            tournamentName: tournament.tournamentName,
            sportId: tournament.sport.id,
            startDate: tournament.startDate,
            endDate: tournament.endDate,
            maxTeams: tournament.maxTeams,
            registrationDeadline: tournament.registrationDeadline,
            prizes: tournament.prizes,
            thumUrl: tournament.thumUrl,
        });
        setShowInputForm(true);
    };

    const filteredTournaments = tournaments.filter((tournament) =>
        tournament.tournamentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.manageTournaments}>
            {isLoading && <Loading />}
            <button className={`btn ${styles.addButton}`} onClick={handleToggleShowAddTournament}>
                {isEditing ? 'Hủy chỉnh sửa' : 'Thêm giải đấu mới'}
            </button>

            <div className={styles.searchContainer}>
                <input
                    type='text'
                    placeholder='Tìm kiếm theo tên giải đấu...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {(showInputForm || isEditing) && (
                <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit} className={styles.inputForm}>
                    <div className={styles.formContainer}>{/* Form fields go here */}</div>
                </form>
            )}

            <table className={`mt-4 ${styles.tournamentsTable}`}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên Giải đấu</th>
                        <th>Môn Thể Thao</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th>Số đội tối đa</th>
                        <th>Hạn đăng ký</th>
                        <th>Ảnh</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTournaments.length > 0 ? (
                        filteredTournaments.map((tournament, index) => (
                            <tr key={tournament.id}>
                                <td>{index + 1 + currentPage * pageSize}</td>
                                <td>{tournament.tournamentName}</td>
                                <td>{tournament.sport.id}</td>
                                <td>{tournament.startDate}</td>
                                <td>{tournament.endDate}</td>
                                <td>{tournament.maxTeams}</td>
                                <td>{tournament.registrationDeadline}</td>
                                <td>
                                    <img
                                        src={tournament.thumUrl}
                                        alt={tournament.tournamentName}
                                        className={styles.tournamentImage}
                                    />
                                </td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <button
                                            className={`btn ${styles.editButton}`}
                                            onClick={() => handleEditClick(tournament)}
                                        >
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            className={`btn ${styles.deleteButton}`}
                                            onClick={() => toggleModalOpen(tournament.id)}
                                        >
                                            Xóa
                                        </button>
                                        {isModalOpen && deleteTournamentId === tournament.id && (
                                            <ConfirmModal
                                                title='Bạn có chắc chắn muốn xóa giải đấu này không?'
                                                isOpen={isModalOpen}
                                                onClose={() => toggleModalOpen(null)}
                                                onSubmit={handleSoftDelete}
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan='9'>Không có giải đấu nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className={styles.pagination}>
                <button disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>
                    Previous
                </button>
                <span>{`Page ${currentPage + 1} of ${totalPages}`}</span>
                <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default ManageTournaments;
