import { useState, useEffect } from 'react';
import styles from '../../../assets/css/Admin/manageTournaments.module.scss';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import { formatDate } from '../../../utils/DateTimeConverter';
import tournamentApi from '../../../services/api/tournament/tournamentApi';
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
    const [registeredTeams, setRegisteredTeams] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);

    // Trạng thái sắp xếp
    const [sortOrderTimePeriod, setSortOrderTimePeriod] = useState('asc');
    const [sortOrderDeadline, setSortOrderDeadline] = useState('asc');
    const [sortedTournaments, setSortedTournaments] = useState(filteredTournaments);

    const toggleViewDetail = () => {
        setIsViewDetailModalOpen(!isViewDetailModalOpen);
    };

    useEffect(() => {
        setSortedTournaments(filteredTournaments);
    }, [filteredTournaments]);

    const handleViewRegisteredTeams = async (tournament) => {
        try {
            const registeredTeamsResponse = await tournamentApi.getRegistedTeams(tournament.id);
            if (registeredTeamsResponse) {
                setRegisteredTeams(registeredTeamsResponse);
                setSelectedTournament(tournament);
                toggleViewDetail();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Sắp xếp theo Time Period
    const handleSortByTimePeriod = () => {
        const sortedData = [...sortedTournaments].sort((a, b) =>
            sortOrderTimePeriod === 'asc'
                ? new Date(a.startDate) - new Date(b.startDate)
                : new Date(b.startDate) - new Date(a.startDate)
        );
        setSortedTournaments(sortedData);
        setSortOrderTimePeriod(sortOrderTimePeriod === 'asc' ? 'desc' : 'asc');
    };

    // Sắp xếp theo Registration Deadline
    const handleSortByDeadline = () => {
        const sortedData = [...sortedTournaments].sort((a, b) =>
            sortOrderDeadline === 'asc'
                ? new Date(a.registrationDeadline) - new Date(b.registrationDeadline)
                : new Date(b.registrationDeadline) - new Date(a.registrationDeadline)
        );
        setSortedTournaments(sortedData);
        setSortOrderDeadline(sortOrderDeadline === 'asc' ? 'desc' : 'asc');
    };

    return (
        <>
            <table className={`mt-4 ${styles.tournamentsTable}`}>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Tournament Name</th>
                        <th onClick={handleSortByTimePeriod} style={{ cursor: 'pointer' }}>
                            Time Period{' '}
                            {sortOrderTimePeriod === 'asc' ? (
                                <i className='fa-solid fa-arrow-up ms-2'></i>
                            ) : (
                                <i className='fa-solid fa-arrow-down ms-2'></i>
                            )}
                        </th>
                        <th>Registered teams</th>
                        <th>Max teams</th>
                        <th onClick={handleSortByDeadline} style={{ cursor: 'pointer' }}>
                            Registration Deadline{' '}
                            {sortOrderDeadline === 'asc' ? (
                                <i className='fa-solid fa-arrow-up ms-2'></i>
                            ) : (
                                <i className='fa-solid fa-arrow-down ms-2'></i>
                            )}
                        </th>
                        <th>Image</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedTournaments.length > 0 ? (
                        sortedTournaments.map((tournament, index) => (
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
        </>
    );
}

export default TournamentTable;
