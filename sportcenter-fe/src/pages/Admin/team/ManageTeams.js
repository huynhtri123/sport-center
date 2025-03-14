/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import teamApi from '../../../services/api/tournament/teamApi';
import styles from '../../../assets/css/Admin/manageTeams.module.scss'; // Đảm bảo đúng đường dẫn
import userApi from '../../../services/api/user/userApi';
import ConfirmModal from '../../../components/Modal/ConfirmModal'; // Đảm bảo đúng đường dẫn
import { Loading } from '../../../components/Loading/Loading';

function ManageTeams() {
    const [teams, setTeams] = useState([]);
    const [userInfo, setUserInfo] = useState({}); // Lưu thông tin user
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teamIdToDelete, setTeamIdToDelete] = useState(null); // Lưu ID của team cần xóa
    const [isLoading, setIsLoading] = useState(false);

    // Lấy danh sách team từ API
    useEffect(() => {
        fetchTeams();
    }, []);

    // Fetch thông tin người dùng
    const fetchUser = async (userId) => {
        try {
            const response = await userApi.getUserById(userId);
            setUserInfo((prevState) => ({
                ...prevState,
                [userId]: response.data, // Lưu thông tin người dùng vào userInfo với userId làm key
            }));
        } catch (error) {
            console.error('Failed to fetch user info:', error);
            // toast.error('Failed to fetch user information.');
        }
    };

    async function fetchTeams() {
        try {
            const response = await teamApi.getAll();
            setTeams(response.data);

            // Fetch thông tin người dùng cho mỗi team
            response.data.forEach((team) => {
                if (team.userId) {
                    fetchUser(team.userId); // Gọi API để lấy thông tin người dùng
                }
            });
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            // toast.error('Failed to fetch teams. Please try again.');
        }
    }

    const handleDeleteTeam = async () => {
        try {
            setIsLoading(true);
            // Gọi API để xóa team
            const response = await teamApi.softDelete(teamIdToDelete);

            // Sau khi xóa thành công, fetch lại danh sách các team
            fetchTeams();
            setIsModalOpen(false); // Đóng modal sau khi xóa thành công

            toast.success(response.message);
        } catch (err) {
            console.error('Failed to delete team:', err);
            setIsModalOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    const openDeleteModal = (teamId) => {
        setTeamIdToDelete(teamId); // Lưu ID của team cần xóa
        setIsModalOpen(true); // Mở modal
    };

    const closeModal = () => {
        setIsModalOpen(false); // Đóng modal
        setTeamIdToDelete(null); // Reset teamIdToDelete
    };

    return (
        <div className={styles.manageTeams}>
            {isLoading && <Loading></Loading>}
            <table className={styles.teamsTable}>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Team Name</th>
                        <th>Owner</th>
                        <th>Logo</th>
                        <th>Players</th>
                        {/* <th>Enrolled Tournaments</th> */}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {teams &&
                        teams.map((team, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{team.teamName}</td>
                                <td>
                                    {/* Hiển thị fullName, email và phoneNumber của người dùng */}
                                    {userInfo[team.userId] ? (
                                        <>
                                            <strong>{userInfo[team.userId].fullName}</strong>
                                            <div>{userInfo[team.userId].email}</div>
                                            <div>{userInfo[team.userId].phoneNumber}</div>
                                        </>
                                    ) : (
                                        'Loading...'
                                    )}
                                </td>
                                <td>
                                    {team.teamLogoUrl ? (
                                        <img src={team.teamLogoUrl} alt={team.teamName} className={styles.teamLogo} />
                                    ) : (
                                        'No Logo'
                                    )}
                                </td>
                                <td>
                                    {team.players && team.players.length > 0 ? (
                                        <ul className={styles.playerList}>
                                            {team.players.map((player, idx) => (
                                                <li key={idx}>
                                                    <strong>{player.name}</strong>
                                                    <span className={styles.position}>{player.position}</span>
                                                    <span className={styles.number}>#{player.number}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        'No Players'
                                    )}
                                </td>

                                {/* <td>
                                    {team.enrolledTournaments && team.enrolledTournaments.length > 0
                                        ? team.enrolledTournaments.map((tournament, idx) => (
                                              <span key={idx}>
                                                  {tournament.tournamentName}
                                                  {idx < team.enrolledTournaments.length - 1 ? ', ' : ''}
                                              </span>
                                          ))
                                        : 'No Tournaments'}
                                </td> */}
                                <td>
                                    <button
                                        className={`btn ${styles.deleteButton}`}
                                        onClick={() => openDeleteModal(team.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

            {/* Modal xác nhận */}
            <ConfirmModal
                title='Are you sure you want to delete this team?'
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleDeleteTeam}
            />
        </div>
    );
}

export default ManageTeams;
