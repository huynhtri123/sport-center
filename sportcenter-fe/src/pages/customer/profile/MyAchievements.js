import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import styles from '../../../assets/css/profile/myAchievements.module.scss';
import ConfirmModal from '../../../components/modal/ConfirmModal';
import { Loading } from '../../../components/loadings/Loading';
import teamApi from '../../../services/api/tournament/teamApi';
import formatCurrency from '../../../utils/formatCurrency';

function MyAchievements({ teams }) {
    const [localTeams, setLocalTeams] = useState([]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState(null);

    useEffect(() => {
        setLocalTeams(teams);
    }, [teams]);

    const handleToggleConfirmModal = (teamId) => {
        setTeamToDelete(teamId); // Lưu ID team vào teamToDelete
        setIsConfirmModalOpen(!isConfirmModalOpen);
    };

    const handleDeleteTeam = async () => {
        if (teamToDelete === null) return; // Nếu không có team nào để xóa thì thoát
        try {
            setIsLoading(true);
            const softDeleteResponse = await teamApi.softDelete(teamToDelete);
            console.log(softDeleteResponse);
            // Chỉ xóa team sau khi nhận được phản hồi từ API
            setLocalTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamToDelete));
            toast.success(softDeleteResponse.message);
            setTeamToDelete(null); // Đặt lại teamToDelete
        } catch (err) {
            console.error(err);
            // toast.error('Xóa team không thành công.');
        } finally {
            setIsLoading(false);
            setIsConfirmModalOpen(false);
        }
    };

    if (!localTeams || localTeams.length === 0) {
        return <p>No teams available.</p>;
    }

    return (
        <div className={styles.myTeamContainer}>
            {isLoading && <Loading></Loading>}
            {localTeams
                .filter((team) => team.wonTournamentIds && team.wonTournamentIds.length > 0) // lấy đội có giải thôi
                .map((team) => (
                    <div key={team.id} className={styles.teamCard}>
                        <div className={styles.teamInfo}>
                            <div className={styles.teamLogoContainer}>
                                {team.teamLogoUrl ? (
                                    <img src={team.teamLogoUrl} alt={team.teamName} className={styles.teamLogo} />
                                ) : (
                                    <div className={styles.noLogo}>No Logo Available</div>
                                )}
                                <h4 className={styles.teamTitle}>{team.teamName || 'Team Name Not Available'}</h4>
                            </div>
                            <div className={styles.playersList}>
                                <h5>Players:</h5>
                                {team.players && team.players.length > 0 ? (
                                    team.players.map((player, idx) => (
                                        <div key={idx} className={styles.playerInfo}>
                                            <p>{player.name}</p>
                                            {player.position && <p>Position: {player.position}</p>}
                                            {player.number && <p>Number: {player.number}</p>}
                                        </div>
                                    ))
                                ) : (
                                    <p>No players available.</p>
                                )}
                            </div>
                        </div>
                        <div className={styles.achievements}>
                            <h5>Achievements:</h5>
                            {team.wonTournamentIds && team.wonTournamentIds.length > 0 ? (
                                team.wonTournamentIds.map((tournament, idx) => {
                                    const prize = team.wonPrizes && team.wonPrizes[idx];
                                    return (
                                        <div key={idx} className={styles.achievementItem}>
                                            <p>
                                                <strong>Tournament:</strong> {tournament.tournamentName}
                                            </p>
                                            {prize ? (
                                                <>
                                                    <p>
                                                        <strong>Position:</strong> {prize.position}
                                                    </p>
                                                    <p>
                                                        <strong>Description:</strong> {prize.description}
                                                    </p>
                                                    <p>
                                                        <strong>Reward:</strong>{' '}
                                                        {formatCurrency(prize.reward.toFixed(2))}
                                                    </p>
                                                </>
                                            ) : (
                                                <p>No prize information available.</p>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p>No achievements available.</p>
                            )}
                        </div>

                        {/* <button className={styles.deleteButton} onClick={() => handleToggleConfirmModal(team.id)}>
                            Delete Team
                        </button> */}

                        {isConfirmModalOpen && (
                            <ConfirmModal
                                title={'Are you sure you still want to delete this team?'}
                                isOpen={isConfirmModalOpen}
                                onClose={handleToggleConfirmModal}
                                onSubmit={handleDeleteTeam}
                            />
                        )}
                    </div>
                ))}
        </div>
    );
}

export default MyAchievements;
