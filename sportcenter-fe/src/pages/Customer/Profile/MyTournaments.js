import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../../assets/css/Profile/myTournaments.module.scss';
import userApi from '../../../services/api/userApi';
import { Loading } from '../../../components/Loading/Loading';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import TeamEditModal from '../../../components/Modal/TeamEditModal';
import tournamentApi from '../../../services/api/tournamentApi';

function MyTournaments({ tournaments }) {
    const [localTournaments, setLocalTournaments] = useState([]);
    useEffect(() => {
        setLocalTournaments(tournaments);
    }, [tournaments]);

    return (
        <div className={styles.myTournamentsContainer}>
            {localTournaments.length > 0 ? (
                localTournaments.map((tournament) => (
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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [team, setTeam] = useState(tournament.team);

    const handleToggleConfirmModal = () => {
        setIsConfirmModalOpen(!isConfirmModalOpen);
    };

    const handleToggleEditModal = () => {
        setIsEditModalOpen(!isEditModalOpen);
    };

    const handleUnregister = async (tournamentId) => {
        try {
            setIsLoading(true);
            const unregisterRequest = { tournamentId, teamId: team.id };
            const unregisterResponse = await userApi.unregisterTournament(unregisterRequest);
            toast.success(unregisterResponse.message);
            setLocalTournaments((prev) => prev.filter((t) => t.id !== tournamentId));
            setIsConfirmModalOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateTeam = async (updatedTeam, file) => {
        try {
            setIsLoading(true);
            const formData = new FormData();

            const updateRequest = { tournamentId: tournament.id, teamRequest: updatedTeam };
            formData.append('request', new Blob([JSON.stringify(updateRequest)], { type: 'application/json' }));

            // Nếu có tệp logo, thêm vào FormData
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
                <h4>{tournament.tournamentName}</h4>
                <p>Sport: {tournament.sport?.sportName}</p>
                <p>Start Date: {new Date(tournament.startDate).toLocaleDateString()}</p>
                <p>End Date: {new Date(tournament.endDate).toLocaleDateString()}</p>
                <p>
                    Registered Teams: {tournament.registeredTeamIds.length} / {tournament.maxTeams}
                </p>
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
                    <button className={styles.cancelButton} onClick={handleToggleConfirmModal}>
                        Cancel Registration
                    </button>
                    {isConfirmModalOpen && (
                        <ConfirmModal
                            title='Are you sure you want to cancel your registration?'
                            isOpen={isConfirmModalOpen}
                            onClose={handleToggleConfirmModal}
                            onSubmit={() => handleUnregister(tournament.id)}
                        />
                    )}
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
