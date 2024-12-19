import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import styles from '../../../assets/css/Profile/myTeam.module.scss';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import { Loading } from '../../../components/Loading/Loading';
import teamApi from '../../../services/api/teamApi';

function MyTeam({ teams }) {
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
            {localTeams.map((team) => (
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
                    <div className={styles.tournaments}>
                        <h5>Enrolled Tournaments:</h5>
                        {team.enrolledTournaments && team.enrolledTournaments.length > 0 ? (
                            team.enrolledTournaments.map((tournament, idx) => (
                                <p key={idx}>{tournament.tournamentName}</p>
                            ))
                        ) : (
                            <p>No enrolled tournaments.</p>
                        )}
                    </div>
                    <div className={styles.prizes}>
                        <h5>Won Prizes:</h5>
                        {team.wonPrizes && team.wonPrizes.length > 0 ? (
                            team.wonPrizes.map((prize, idx) => (
                                <div key={idx} className={styles.prizeInfo}>
                                    <p>Position: {prize.position}</p>
                                    <p>Description: {prize.description}</p>
                                    <p>Reward: ${prize.reward.toFixed(2)}</p>
                                </div>
                            ))
                        ) : (
                            <p>No prizes won.</p>
                        )}
                    </div>
                    <button className={styles.deleteButton} onClick={() => handleToggleConfirmModal(team.id)}>
                        Delete Team
                    </button>

                    {isConfirmModalOpen && (
                        <ConfirmModal
                            title={'Bạn có chắc vẫn muốn xoá Team này?'}
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

export default MyTeam;
