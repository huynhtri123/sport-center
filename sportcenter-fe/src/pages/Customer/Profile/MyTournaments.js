import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../../assets/css/Profile/myTournaments.module.scss';
import userApi from '../../../services/api/userApi';
import { Loading } from '../../../components/Loading/Loading';
import ConfirmModal from '../../../components/Modal/ConfirmModal';

function MyTournaments({ tournaments }) {
    const [localTournamets, setLocalTournaments] = useState([]);
    useEffect(() => {
        setLocalTournaments(tournaments);
    }, [tournaments]);

    return (
        <div className={styles.myTournamentsContainer}>
            {localTournamets.length > 0 ? (
                localTournamets.map((tournament) => (
                    <TournamentCard
                        key={tournament.id}
                        tournament={tournament}
                        setLocalTournaments={setLocalTournaments}
                    />
                ))
            ) : (
                <p>No tournaments available.</p>
            )}
        </div>
    );
}

function TournamentCard({ tournament, setLocalTournaments }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const handleToggleConfirmModal = () => {
        setIsConfirmModalOpen(!isConfirmModalOpen);
    };

    const team = tournament.team; // Lấy thông tin đội
    const handleUnregister = async (tounamentId) => {
        try {
            setIsLoading(true);
            const unregisterRequest = {
                tournamentId: tounamentId,
                teamId: team.id,
            };
            // console.log(unregisterRequest);
            const unregisterResponse = await userApi.unregisterTournament(unregisterRequest);
            toast.success(unregisterResponse.message);
            setLocalTournaments((prevTournaments) => prevTournaments.filter((t) => t.id !== tounamentId));
            setIsConfirmModalOpen(false);
            // console.log(unregisterResponse);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className={styles.tournamentCard}>
            {isLoading && <Loading></Loading>}
            <div className={styles.tournamentInfo}>
                <h4>{tournament.tournamentName}</h4>
                <p>Sport: {tournament.sport?.sportName}</p>
                <p>Start Date: {new Date(tournament.startDate).toLocaleDateString()}</p>
                <p>End Date: {new Date(tournament.endDate).toLocaleDateString()}</p>
                <p>Registered Teams: {tournament.registeredTeamIds.length}</p>
                <p>Max Teams: {tournament.maxTeams}</p>
            </div>
            {team && ( // Kiểm tra nếu có thông tin đội
                <div className={styles.teamInfo}>
                    <h5 className={styles.teamTitle}>My Team</h5> {/* Thêm tiêu đề cho phần team */}
                    <img src={team.teamLogoUrl} alt={team.teamName} className={styles.teamLogo} />
                    <div className={styles.teamName}>{team.teamName}</div>
                    <div className={styles.teamPlayers}>
                        Players: {team.players.map((player) => player.name).join(', ')}
                    </div>
                    <button className={styles.cancelButton} onClick={() => handleToggleConfirmModal()}>
                        Cancel Registration
                    </button>{' '}
                    {isConfirmModalOpen && (
                        <ConfirmModal
                            title={
                                'Are you sure you want to cancel your tournament registration? This action is non-refundable and cannot be undone!'
                            }
                            isOpen={isConfirmModalOpen}
                            onClose={handleToggleConfirmModal}
                            onSubmit={() => handleUnregister(tournament.id)}
                        ></ConfirmModal>
                    )}
                </div>
            )}
        </div>
    );
}

export default MyTournaments;
