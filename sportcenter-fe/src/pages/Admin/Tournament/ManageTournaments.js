import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../../assets/css/Admin/manageTournaments.module.scss';
import tournamentApi from '../../../services/api/tournamentApi';
import { Loading } from '../../../components/Loading/Loading';
import Button from '../../../components/Button/Button';
import TournamentTable from './TournamentTable';

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
        registrationFee: 0,
        rules: [],
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

    // xử lý phần phí tham gia và quy định
    const handleRuleChange = (index, value) => {
        const updatedRules = [...(isEditing ? editFormData.rules : formData.rules)];
        updatedRules[index] = value;
        if (isEditing) {
            setEditFormData({ ...editFormData, rules: updatedRules });
        } else {
            setFormData({ ...formData, rules: updatedRules });
        }
    };

    const handleAddRule = (e) => {
        e.preventDefault();
        const currentRules = (isEditing ? editFormData.rules : formData.rules) || []; // Nếu null hoặc undefined, đặt là []
        const updatedRules = [...currentRules, ''];

        if (isEditing) {
            setEditFormData({ ...editFormData, rules: updatedRules });
        } else {
            setFormData({ ...formData, rules: updatedRules });
        }
    };

    const handleRemoveRule = (e, index) => {
        e.preventDefault();
        const updatedRules = [...(isEditing ? editFormData.rules : formData.rules)];
        updatedRules.splice(index, 1);
        if (isEditing) {
            setEditFormData({ ...editFormData, rules: updatedRules });
        } else {
            setFormData({ ...formData, rules: updatedRules });
        }
    };

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

    const convertToLocal = (isoDate) => {
        if (!isoDate) return ''; // Trường hợp không có dữ liệu
        const localDate = new Date(isoDate);
        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset()); // Bù trừ múi giờ
        return localDate.toISOString().slice(0, 16); // Cắt bỏ phần giây và Z
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        // console.log(formData);
        try {
            setIsLoading(true);
            const createResponse = await tournamentApi.create(formData);
            // console.log(createResponse);
            toast.success(createResponse.message);
            getTournaments();
            resetFormData();
        } catch (err) {
            toast.error(err);
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
            setIsLoading(true);
            const response = await tournamentApi.searchTournaments(searchQuery, currentPage, pageSize);
            setTournaments(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, searchQuery]);

    useEffect(() => {
        getTournaments();
    }, [getTournaments]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0); // Reset currentPage to 0 on new search
    };

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
            registrationFee: tournament.registrationFee,
            rules: tournament.rules,
        });
        setShowInputForm(true);
    };

    const filteredTournaments = tournaments.filter((tournament) =>
        tournament.tournamentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddPrize = (e) => {
        e.preventDefault();
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

    const handlePrizeChange = (index, field, value) => {
        const prizes = isEditing ? [...editFormData.prizes] : [...formData.prizes];
        prizes[index] = { ...prizes[index], [field]: value };
        if (isEditing) {
            setEditFormData((prevData) => ({ ...prevData, prizes }));
        } else {
            setFormData((prevData) => ({ ...prevData, prizes }));
        }
    };

    const handleRemovePrize = (e, index) => {
        e.preventDefault();
        const prizes = isEditing ? [...editFormData.prizes] : [...formData.prizes];
        prizes.splice(index, 1);
        if (isEditing) {
            setEditFormData((prevData) => ({ ...prevData, prizes }));
        } else {
            setFormData((prevData) => ({ ...prevData, prizes }));
        }
    };

    return (
        <div className={styles.manageTournaments}>
            {isLoading && <Loading />}
            <div className={styles.searchContainer}>
                <input
                    type='text'
                    placeholder='Search tournament by name...'
                    value={searchQuery}
                    onChange={handleSearch}
                    className={styles.searchInput}
                />
            </div>

            <Button className={`btn ${styles.addButton}`} onClick={handleToggleShowAddTournament}>
                {isEditing ? 'Cancel Edit' : 'Add new tournament'}
            </Button>

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
                                    isEditing
                                        ? convertToLocal(editFormData.startDate) // Hiển thị thời gian theo +7
                                        : convertToLocal(formData.startDate) // Hiển thị thời gian theo +7
                                }
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
                                value={
                                    isEditing
                                        ? convertToLocal(editFormData.endDate) // Hiển thị thời gian theo +7
                                        : convertToLocal(formData.endDate) // Hiển thị thời gian theo +7
                                } // Chuyển đổi ngày thành định dạng datetime-local
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
                                        ? convertToLocal(editFormData.registrationDeadline) // Hiển thị thời gian theo +7
                                        : convertToLocal(formData.registrationDeadline) // Hiển thị thời gian theo +7
                                }
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Khối: Phí - Quy định - Giải thưởng */}
                        <div className={styles.inputGroup}>
                            {/* Khối nhập phí đăng ký */}
                            <label htmlFor='registrationFee' className='me-3'>
                                Phí đăng ký tham gia (VND)
                            </label>
                            <input
                                className={styles.fee}
                                id='registrationFee'
                                type='number'
                                min={0}
                                step={1000}
                                name='registrationFee'
                                value={isEditing ? editFormData.registrationFee : formData.registrationFee}
                                placeholder='Phí đăng ký (USD)'
                                onChange={handleChange}
                                required
                            />

                            {/* Khối nhập quy định giải đấu */}
                            <div className={styles.rulesContainer}>
                                <h4>Quy định giải đấu</h4>
                                {(isEditing ? editFormData.rules || [] : formData.rules || []).map((rule, index) => (
                                    <div key={index} className={styles.ruleItem}>
                                        <input
                                            type='text'
                                            placeholder={`Quy định ${index + 1}`}
                                            value={rule}
                                            onChange={(e) => handleRuleChange(index, e.target.value)}
                                            required
                                        />
                                        <button type='button' onClick={(e) => handleRemoveRule(e, index)}>
                                            Delete
                                        </button>
                                    </div>
                                ))}
                                <Button type='button' onClick={handleAddRule} className={`btn ${styles.addRuleButton}`}>
                                    Add new rule
                                </Button>
                            </div>

                            {/* Khối nhập giải thưởng */}
                            <div className={styles.prizesContainer}>
                                <h4>Giải Thưởng</h4>
                                {(isEditing ? editFormData.prizes : formData.prizes).map((prize, index) => (
                                    <div key={index} className={styles.prizeItem}>
                                        <label htmlFor={`position-${index}`} className='ms-3'>
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
                                        <label htmlFor={`description-${index}`} className='ms-3'>
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
                                        <label htmlFor={`reward-${index}`} className='ms-3'>
                                            Thưởng (VND)
                                        </label>
                                        <input
                                            id={`reward-${index}`}
                                            type='number'
                                            min={0}
                                            placeholder='Giải (USD)'
                                            value={prize.reward}
                                            onChange={(e) => handlePrizeChange(index, 'reward', e.target.value)}
                                            required
                                        />
                                        <Button
                                            type='button'
                                            className={styles.btnDelete}
                                            onClick={(e) => handleRemovePrize(e, index)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type='button'
                                    onClick={handleAddPrize}
                                    className={`btn ${styles.addPrizeButton}`}
                                >
                                    New prize
                                </Button>
                            </div>
                        </div>
                    </div>
                    {/* Nút submit (tạo giải đấu) */}
                    <div className={styles.inputGroup}>
                        <button type='submit' className={`btn ${styles.submitButton}`}>
                            {isEditing ? 'Save changes' : 'Create tournament'}
                        </button>
                    </div>
                </form>
            )}

            <TournamentTable
                filteredTournaments={tournaments}
                currentPage={currentPage}
                pageSize={pageSize}
                handleEditClick={handleEditClick}
                toggleModalOpen={toggleModalOpen}
                isModalOpen={isModalOpen}
                deleteTournamentId={deleteTournamentId}
                handleSoftDelete={handleSoftDelete}
            ></TournamentTable>

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
