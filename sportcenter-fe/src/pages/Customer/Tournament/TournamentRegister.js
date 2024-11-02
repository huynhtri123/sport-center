import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import styles from '../../../assets/css/Tournament/tournamentRegister.module.scss';
import Button from '../../../components/Button/Button';
import tournamentApi from '../../../services/api/tournamentApi';
import { useTournament } from '../../../customs/hooks';
import fileApi from '../../../services/api/fileApi';
import teamApi from '../../../services/api/teamApi';
import { Loading } from '../../../components/Loading/Loading';

function TournamentRegister() {
    const [tournament] = useTournament();
    const [teamName, setTeamName] = useState('');
    const [teamLogoUrl, setTeamLogoUrl] = useState('');
    const [numPlayers, setNumPlayers] = useState(1);
    const [players, setPlayers] = useState([{ name: '', position: '', number: '' }]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleNumPlayersChange = (e) => {
        const count = parseInt(e.target.value, 10); // chuyển string thành số nguyên hệ 10
        setNumPlayers(count);

        const updatedPlayers = [...players];
        while (updatedPlayers.length < count) {
            updatedPlayers.push({ name: '', position: '', number: '' });
        }
        while (updatedPlayers.length > count) {
            updatedPlayers.pop();
        }
        setPlayers(updatedPlayers);
    };

    const handlePlayerChange = (index, field, value) => {
        const updatedPlayers = players.map((player, i) => (i === index ? { ...player, [field]: value } : player));
        setPlayers(updatedPlayers);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setIsLoading(true);
                const uploadResponse = await fileApi.uploadImage(file);
                // console.log(uploadResponse);
                setTeamLogoUrl(uploadResponse.data.url);
                toast.info(uploadResponse.message);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleRegister = async () => {
        if (!teamName) {
            setErrorMessage('Bạn chưa nhập tên cho đội!');
            return;
        }
        // Kiểm tra xem tất cả các thành viên đều có tên không
        const allPlayersValid = players.every((player) => player.name.trim() !== '');
        if (!allPlayersValid) {
            setErrorMessage('Tất cả các thành viên cần có tên!');
            return;
        }

        let createdTeamId = null;

        try {
            setIsLoading(true);
            // tạo Team
            const teamRequest = {
                teamName,
                players,
                teamLogoUrl: teamLogoUrl,
                enrolledTournamentIds: [tournament.id],
            };

            const teamResponse = await teamApi.create(teamRequest);
            // console.log(teamResponse);
            toast.success(teamResponse.message);
            createdTeamId = teamResponse.data.id;

            // đăng kí
            const registerRequest = {
                tournamentId: tournament.id,
                teamId: teamResponse.data.id,
            };
            const registerRespones = await tournamentApi.register(registerRequest);
            // console.log(registerRespones);
            toast(registerRespones.message);
            localStorage.setItem('selectedTournament', JSON.stringify(registerRespones.data));
            navigate('/tournament/detail');
        } catch (error) {
            console.error('Đăng ký thất bại:', error);
            setErrorMessage('Có lỗi xảy ra, vui lòng thử lại!');
            // đăng kí ko thành công thì xoá đội vừa tạo luôn
            if (createdTeamId) {
                try {
                    const forceDeleteResponse = await teamApi.forceDelete(createdTeamId);
                    console.log(forceDeleteResponse);
                } catch (err) {
                    console.error(err);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/tournament/detail');
    };

    return (
        <div className={styles.tournamentRegisterContainer}>
            {isLoading && <Loading></Loading>}

            <h1>Đăng ký Tham gia Giải đấu: {tournament.tournamentName}</h1>

            <div className={styles.flexContainer}>
                {/* Thông tin đội */}
                <div className={styles.formSection}>
                    <label>Tên Đội:</label>
                    <input
                        type='text'
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder='Nhập tên đội'
                        required
                    />

                    <label>Logo Đội:</label>
                    <input type='file' onChange={handleFileChange} />

                    <label>Số lượng thành viên:</label>
                    <input type='number' min='1' value={numPlayers} onChange={handleNumPlayersChange} />
                </div>

                {/* Danh sách thành viên */}
                <div className={styles.playersSection}>
                    {players.map((player, index) => (
                        <div key={index} className={styles.playerInput}>
                            <h4>Thành viên {index + 1}</h4>
                            <input
                                type='text'
                                placeholder='Tên cầu thủ'
                                value={player.name}
                                onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                                required
                            />
                            <input
                                type='text'
                                placeholder='Vị trí (optional)'
                                value={player.position}
                                onChange={(e) => handlePlayerChange(index, 'position', e.target.value)}
                            />
                            <input
                                type='number'
                                placeholder='Số áo (optional)'
                                value={player.number}
                                onChange={(e) => handlePlayerChange(index, 'number', e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {errorMessage && <p className={styles.error}>{errorMessage}</p>}

            <div className={styles.actions}>
                <Button onClick={handleRegister}>Đăng ký</Button>
                <Button onClick={() => handleBack()} className={styles.cancelButton}>
                    Quay lại
                </Button>
            </div>
        </div>
    );
}

export default TournamentRegister;
