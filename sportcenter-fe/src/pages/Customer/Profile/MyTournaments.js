import React, { useEffect, useState } from 'react';
import { Pagination, Modal } from 'antd';
import { toast } from 'react-toastify';
import styles from '../../../assets/css/Profile/myTournaments.module.scss';
import userApi from '../../../services/api/user/userApi';
import { Loading } from '../../../components/Loading/Loading';
import TeamEditModal from '../../../components/Modal/TeamEditModal';
import tournamentApi from '../../../services/api/tournament/tournamentApi';
import formatCurrency from '../../../utils/formatCurrency';

function MyTournaments({ tournaments }) {
    const [localTournaments, setLocalTournaments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 1;

    useEffect(() => {
        setLocalTournaments(tournaments);
    }, [tournaments]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const paginatedTournaments = localTournaments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className={styles.myTournamentsContainer}>
            {paginatedTournaments.length > 0 ? (
                paginatedTournaments.map((tournament) => (
                    <TournamentCard
                        key={tournament.id}
                        tournament={tournament}
                        setLocalTournaments={setLocalTournaments}
                    />
                ))
            ) : (
                <p>No tournaments available.</p>
            )}
            <Pagination
                current={currentPage}
                pageSize={itemsPerPage}
                total={localTournaments.length}
                onChange={handlePageChange}
                className={styles.pagination}
            />
        </div>
    );
}

function TournamentCard({ tournament, setLocalTournaments }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [team, setTeam] = useState(tournament.team);

    const handleToggleEditModal = () => {
        setIsEditModalOpen(!isEditModalOpen);
    };

    const handleUnregister = async (tournamentId) => {
        try {
            setIsLoading(true);
            const unregisterRequest = { tournamentId, teamId: team.id };
            const unregisterResponse = await userApi.unregisterTournament(unregisterRequest);

            toast.success(unregisterResponse.message);
            setLocalTournaments((prevTournaments) => prevTournaments.filter((t) => t.id !== tournamentId));
        } catch (err) {
            console.error(err);
            toast.error('Failed to unregister from the tournament!');
        } finally {
            setIsLoading(false);
        }
    };

    const showConfirm = () => {
        Modal.confirm({
            title: 'Are you sure you want to cancel your registration?',
            content: 'This action will not be refunded.',
            okText: 'Yes, Cancel',
            cancelText: 'No',
            onOk: () => handleUnregister(tournament.id),
        });
    };

    const handleUpdateTeam = async (updatedTeam, file) => {
        try {
            setIsLoading(true);
            const formData = new FormData();

            const updateRequest = { tournamentId: tournament.id, teamRequest: updatedTeam };
            formData.append('request', new Blob([JSON.stringify(updateRequest)], { type: 'application/json' }));

            if (file) {
                formData.append('file', file);
            }

            const response = await tournamentApi.updateTeam(formData, updatedTeam.id);

            setTeam(response.data);
            toast.success('Team updated successfully!');
            setIsEditModalOpen(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update team!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.tournamentCard}>
            {isLoading && <Loading />}
            <div className={styles.tournamentInfo}>
                {/* Ảnh Thumbnail */}
                {tournament.thumUrl && (
                    <img src={tournament.thumUrl} alt='Tournament Thumbnail' className={styles.thumbnail} />
                )}

                <h4>{tournament.tournamentName}</h4>
                <p style={{ color: '#7393B3' }}>Sport: {tournament.sport?.sportName}</p>
                <p>Start Date: {new Date(tournament.startDate).toLocaleDateString()}</p>
                {/* <p>End Date: {new Date(tournament.endDate).toLocaleDateString()}</p> */}
                <p>Registration fee: {formatCurrency(tournament.registrationFee)}</p>
                <p>
                    Registered Teams: {tournament.registeredTeamIds.length} / {tournament.maxTeams}
                </p>

                {/* Danh sách giải thưởng */}
                {tournament.prizes?.length > 0 && (
                    <div className={styles.prizes}>
                        <h5>🏆 Prizes</h5>
                        <ul>
                            {tournament.prizes.map((prize, index) => (
                                <li key={index}>
                                    <strong>Position {prize.position}:</strong> {prize.description} -{' '}
                                    {formatCurrency(prize.reward)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Danh sách quy định */}
                {tournament.rules?.length > 0 && (
                    <div className={styles.rules}>
                        <h5>📜 Rules</h5>
                        <ul>
                            {tournament.rules.map((rule, index) => (
                                <li key={index}>{rule}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {team && (
                <div className={styles.teamInfo}>
                    <h5 className={styles.teamTitle}>My Team</h5>
                    <img src={team.teamLogoUrl} alt={team.teamName} className={styles.teamLogo} />
                    <div className={styles.teamName}>{team.teamName}</div>
                    <div className={styles.teamPlayers}>Players: {team.players.map((p) => p.name).join(', ')}</div>
                    <button className={styles.editButton} onClick={handleToggleEditModal}>
                        Update Info
                    </button>
                    <button className={styles.cancelButton} onClick={showConfirm}>
                        Cancel Registration
                    </button>
                    {isEditModalOpen && (
                        <TeamEditModal
                            isOpen={isEditModalOpen}
                            team={team}
                            onClose={handleToggleEditModal}
                            onSave={handleUpdateTeam}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default MyTournaments;
