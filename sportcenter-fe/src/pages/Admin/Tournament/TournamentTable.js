import { useState } from 'react';
import styles from '../../../assets/css/Admin/manageTournaments.module.scss';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import { formatDate } from '../../../utils/DateTimeConverter';
import tournamentApi from '../../../services/api/tournamentApi';
import DetailModal from './DetailModal';

function TournamentTable({
    filteredTournaments,
    currentPage,
    pageSize,
    handleEditClick,
    toggleModalOpen,
    isModalOpen,
    deleteTournamentId,
    handleSoftDelete,
}) {
    const [isViewDetailModalOpen, setIsViewDetailModalOpen] = useState(false);
    const [registeredTeams, setRegisteredTeams] = useState([]); // Lưu danh sách đội đăng ký
    const [selectedTournament, setSelectedTournament] = useState(null); // Lưu thông tin giải đấu được chọn

    const toggleViewDetail = () => {
        setIsViewDetailModalOpen(!isViewDetailModalOpen);
    };

    const handleViewRegisteredTeams = async (tournament) => {
        try {
            const registeredTeamsResponse = await tournamentApi.getRegistedTeams(tournament.id);
            if (registeredTeamsResponse) {
                setRegisteredTeams(registeredTeamsResponse); // Lưu danh sách đội đăng ký
                setSelectedTournament(tournament); // Lưu thông tin giải đấu
                console.log(registeredTeams);
                toggleViewDetail(); // Mở modal
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <table className={`mt-4 ${styles.tournamentsTable}`}>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Tournament Name</th>
                        <th>Time Period</th>
                        <th>Max teams</th>
                        <th>Registered teams</th>
                        <th>Registration Deadline</th>
                        <th>Image</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTournaments.length > 0 ? (
                        filteredTournaments.map((tournament, index) => (
                            <tr key={tournament.id}>
                                <td>{index + 1 + currentPage * pageSize}</td>
                                <td>{tournament.tournamentName}</td>
                                <td>
                                    {formatDate(tournament.startDate)} <br />
                                    {new Date(tournament.startDate).toLocaleTimeString()} <br />
                                    {' - '} <br />
                                    {formatDate(tournament.endDate)} <br />
                                    {new Date(tournament.endDate).toLocaleTimeString()}
                                </td>
                                <td>
                                    {tournament.registeredTeamIds ? tournament.registeredTeamIds.length : 0}{' '}
                                    {tournament.registeredTeamIds.length > 0 ? (
                                        <i
                                            className='fa-regular fa-eye'
                                            title='View details'
                                            onClick={() => handleViewRegisteredTeams(tournament)}
                                        ></i>
                                    ) : (
                                        ''
                                    )}
                                </td>
                                <td>{tournament.maxTeams}</td>
                                <td>
                                    {formatDate(tournament.registrationDeadline)} <br />
                                    {new Date(tournament.registrationDeadline).toLocaleTimeString()}
                                </td>
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
                                            Edit
                                        </button>
                                        <button
                                            className={`btn ${styles.deleteButton}`}
                                            onClick={() => toggleModalOpen(tournament.id)}
                                        >
                                            Delete
                                        </button>

                                        {isViewDetailModalOpen && (
                                            <DetailModal
                                                isOpen={isViewDetailModalOpen}
                                                onClose={toggleViewDetail}
                                                title={`${selectedTournament?.tournamentName} Participants:`}
                                                registeredTeams={registeredTeams.data}
                                            />
                                        )}

                                        {isModalOpen && deleteTournamentId === tournament.id && (
                                            <ConfirmModal
                                                title='Are you sure you want to delete this tournament?'
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
                            <td colSpan='9'>There are no tournaments.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal hiển thị thông tin đội đã đăng ký */}
            {/* {isViewDetailModalOpen && (
                <ConfirmModal
                    title='Bạn có chắc chắn muốn xóa giải đấu này không?'
                    isOpen={isModalOpen}
                    onClose={() => toggleModalOpen(null)}
                    onSubmit={handleSoftDelete}
                />
            )} */}
        </>
    );
}

export default TournamentTable;
