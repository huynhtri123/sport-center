import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../assets/css/Admin/manageTournaments.module.scss';
import tournamentApi from '../../services/api/tournamentApi';
import { Loading } from '../../components/Loading/Loading';
import ConfirmModal from '../../components/Modal/ConfirmModal';

function ManageTournaments() {
    const [tournaments, setTournaments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // State for delete modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteTournamentId, setDeleteTournamentId] = useState(null);

    // State for tournament form
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

    const toggleModalOpen = (tournamentId = null) => {
        setDeleteTournamentId(tournamentId);
        setIsModalOpen(!isModalOpen);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Chỉ xử lý ngày khi name là 'startDate', 'endDate' hoặc 'registrationDeadline'
        if (name === 'startDate' || name === 'endDate' || name === 'registrationDeadline') {
            // Chuyển đổi ngày sang định dạng ISO 8601
            const isoDate = new Date(value).toISOString(); // Chuyển đổi ngày sang định dạng ISO
            if (isEditing) {
                setEditFormData((prevData) => ({ ...prevData, [name]: isoDate }));
            } else {
                setFormData((prevData) => ({ ...prevData, [name]: isoDate }));
            }
        } else {
            // Xử lý các trường khác
            if (isEditing) {
                setEditFormData((prevData) => ({ ...prevData, [name]: value }));
            } else {
                setFormData((prevData) => ({ ...prevData, [name]: value }));
            }
        }
    };

    const handlePrizeChange = (index, field, value) => {
        const prizes = isEditing ? [...editFormData.prizes] : [...formData.prizes];
        prizes[index] = { ...prizes[index], [field]: value };
        if (isEditing) {
            setEditFormData((prevData) => ({ ...prevData, prizes }));
        } else {
            setFormData((prevData) => ({ ...prevData, prizes }));
        }
    };

    const handleAddPrize = () => {
        const newPrize = { position: '', description: '', reward: '' };
        if (isEditing) {
            setEditFormData((prevData) => ({
                ...prevData,
                prizes: [...prevData.prizes, newPrize],
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                prizes: [...prevData.prizes, newPrize],
            }));
        }
    };

    const handleRemovePrize = (index) => {
        const prizes = isEditing ? [...editFormData.prizes] : [...formData.prizes];
        prizes.splice(index, 1);
        if (isEditing) {
            setEditFormData((prevData) => ({ ...prevData, prizes }));
        } else {
            setFormData((prevData) => ({ ...prevData, prizes }));
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
            const response = await tournamentApi.getAllActive();
            setTournaments(response.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        getTournaments();
    }, [getTournaments]);

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

    return (
        <div className={styles.manageTournaments}>
            {isLoading && <Loading />}
            <button className={`btn ${styles.addButton}`} onClick={handleToggleShowAddTournament}>
                {isEditing ? 'Hủy chỉnh sửa' : 'Thêm giải đấu mới'}
            </button>
            {(showInputForm || isEditing) && (
                <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit} className={styles.inputForm}>
                    <div className={styles.formContainer}>
                        <div className={styles.inputGroup}>
                            <label htmlFor='tournamentName' className='me-3'>
                                Tên giải đấu
                            </label>
                            <input
                                id='tournamentName'
                                type='text'
                                name='tournamentName'
                                value={isEditing ? editFormData.tournamentName : formData.tournamentName}
                                placeholder='Tên giải đấu'
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <div className={styles.inputGroup}>
                                <label htmlFor='thumUrl' className='me-3'>
                                    Ảnh đại diện (URL)
                                </label>
                                <input
                                    id='thumUrl'
                                    type='url'
                                    name='thumUrl'
                                    value={isEditing ? editFormData.thumUrl : formData.thumUrl}
                                    placeholder='URL ảnh đại diện'
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <label htmlFor='sportId' className='me-3'>
                                ID môn thể thao
                            </label>
                            <input
                                id='sportId'
                                type='text'
                                name='sportId'
                                value={isEditing ? editFormData.sportId : formData.sportId}
                                placeholder='ID môn thể thao'
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor='startDate' className='me-3'>
                                Ngày bắt đầu
                            </label>
                            <input
                                id='startDate'
                                type='datetime-local'
                                name='startDate'
                                value={
                                    isEditing ? editFormData.startDate.slice(0, 16) : formData.startDate.slice(0, 16)
                                } // Chuyển đổi ngày thành định dạng datetime-local
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor='endDate' className='me-3'>
                                Ngày kết thúc
                            </label>
                            <input
                                id='endDate'
                                type='datetime-local'
                                name='endDate'
                                value={isEditing ? editFormData.endDate.slice(0, 16) : formData.endDate.slice(0, 16)} // Chuyển đổi ngày thành định dạng datetime-local
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor='maxTeams' className='me-3'>
                                Số đội tối đa
                            </label>
                            <input
                                id='maxTeams'
                                type='number'
                                name='maxTeams'
                                value={isEditing ? editFormData.maxTeams : formData.maxTeams}
                                placeholder='Số đội tối đa'
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor='registrationDeadline' className='me-3'>
                                Hạn đăng ký
                            </label>
                            <input
                                id='registrationDeadline'
                                type='datetime-local'
                                name='registrationDeadline'
                                value={
                                    isEditing
                                        ? editFormData.registrationDeadline.slice(0, 16)
                                        : formData.registrationDeadline.slice(0, 16)
                                } // Chuyển đổi ngày thành định dạng datetime-local
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.prizesContainer}>
                            <h4>Giải Thưởng</h4>
                            {(isEditing ? editFormData.prizes : formData.prizes).map((prize, index) => (
                                <div key={index} className={styles.prizeItem}>
                                    <label htmlFor={`position-${index}`} className='me-3'>
                                        Vị trí
                                    </label>
                                    <input
                                        id={`position-${index}`}
                                        type='number'
                                        placeholder='Vị trí'
                                        value={prize.position}
                                        onChange={(e) => handlePrizeChange(index, 'position', e.target.value)}
                                        required
                                    />
                                    <label htmlFor={`description-${index}`} className='me-3'>
                                        Mô tả
                                    </label>
                                    <input
                                        id={`description-${index}`}
                                        type='text'
                                        placeholder='Mô tả'
                                        value={prize.description}
                                        onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                                        required
                                    />
                                    <label htmlFor={`reward-${index}`} className='me-3'>
                                        Giải (USD)
                                    </label>
                                    <input
                                        id={`reward-${index}`}
                                        type='number'
                                        step='0.01'
                                        placeholder='Giải (USD)'
                                        value={prize.reward}
                                        onChange={(e) => handlePrizeChange(index, 'reward', e.target.value)}
                                        required
                                    />
                                    <button type='button' onClick={() => handleRemovePrize(index)}>
                                        Xóa
                                    </button>
                                </div>
                            ))}
                            <button type='button' onClick={handleAddPrize} className={`btn ${styles.addPrizeButton}`}>
                                Thêm giải thưởng
                            </button>
                        </div>

                        <button type='submit' className={`btn ${styles.submitButton}`}>
                            {isEditing ? 'Lưu thay đổi' : 'Tạo giải đấu'}
                        </button>
                    </div>
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
                    {tournaments.length > 0 ? (
                        tournaments.map((tournament, index) => (
                            <tr key={tournament.id}>
                                <td>{index + 1}</td>
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
        </div>
    );
}

export default ManageTournaments;
