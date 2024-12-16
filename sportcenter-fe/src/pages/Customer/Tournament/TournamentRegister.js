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
import PaymentModal from '../../../components/Modal/PaymentModal';
import { defaultIcon } from '../../../utils/defaultIcon';

function TournamentRegister() {
    const [tournament] = useTournament();
    const [teamName, setTeamName] = useState('');
    const [teamLogoUrl, setTeamLogoUrl] = useState(defaultIcon); // URL mặc định cho logo
    const [numPlayers, setNumPlayers] = useState(1);
    const [players, setPlayers] = useState([{ name: '', position: '', number: '' }]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const toggleModalOpen = () => {
        setIsModalOpen(!isModalOpen);
    };

    const [isChecking, setIsChecking] = useState(false);

    const checkExistedTeam = async () => {
        try {
            // console.log(teamName);
            const isNotExisted = await teamApi.checkExistedName(teamName);
            // nếu trùng là ko có response
            if (!isNotExisted) {
                return true; // tên bị trùng
            }
            return false;
        } catch (err) {
            // console.error(err);
            return true; // tên bị trùng
        }
    };

    const handleRegisterClick = async () => {
        const isExisted = await checkExistedTeam();
        if (isExisted) {
            // tên bị trùng
            return;
        }
        if (validateInputs()) {
            toggleModalOpen(); // Chỉ mở modal nếu hợp lệ
        }
    };

    const validateInputs = () => {
        if (!teamName) {
            setErrorMessage('Bạn chưa nhập tên cho đội!');
            return false;
        }
        const allPlayersValid = players.every((player) => player.name.trim() !== '');
        if (!allPlayersValid) {
            setErrorMessage('Tất cả các thành viên cần có tên!');
            return false;
        }
        setErrorMessage(''); // Xóa lỗi nếu hợp lệ
        return true;
    };

    const handleNumPlayersChange = (e) => {
        const count = parseInt(e.target.value, 10) || 0;
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
                setTeamLogoUrl(uploadResponse.data.url);
                toast.info('Logo đã được cập nhật!');
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleRegister = async () => {
        let createdTeamId = null;

        try {
            setIsLoading(true);
            const teamRequest = {
                teamName,
                players,
                teamLogoUrl: teamLogoUrl,
                enrolledTournamentIds: [tournament.id],
            };

            const teamResponse = await teamApi.create(teamRequest);
            // toast.success(teamResponse.message);
            createdTeamId = teamResponse.data.id;

            const registerRequest = {
                tournamentId: tournament.id,
                teamId: teamResponse.data.id,
            };
            const registerResponse = await tournamentApi.register(registerRequest);
            toast.success(registerResponse.message);
            localStorage.setItem('selectedTournament', JSON.stringify(registerResponse.data));
            navigate('/tournament/detail');
            return registerResponse.data;
        } catch (error) {
            console.error('Đăng ký thất bại:', error);
            setErrorMessage('Có lỗi xảy ra, vui lòng thử lại!');
            if (createdTeamId) {
                try {
                    // eslint-disable-next-line no-unused-vars
                    const forceDeleteResponse = await teamApi.forceDelete(createdTeamId);
                    // console.log(forceDeleteResponse);
                } catch (err) {
                    console.error(err);
                }
            }
            return null;
        } finally {
            setIsLoading(false);
            setIsModalOpen(false);
        }
    };

    const handleBack = () => {
        navigate('/tournament/detail');
    };

    return (
        <div className={styles.tournamentRegisterContainer}>
            {isLoading && <Loading />}
            <h1>Register Form: {tournament.tournamentName}</h1>
            <div className={styles.formContainer}>
                <div className={styles.teamInfo}>
                    <label>
                        <i class='fa-solid fa-signature'></i> Team Name:
                    </label>
                    <input
                        type='text'
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder='Enter your team name...'
                        required
                    />
                    <label>
                        <i class='fa-regular fa-image'></i> Team Logo:
                    </label>
                    <div className={styles.logoUpload}>
                        <div className={styles.logoWrapper}>
                            <img src={teamLogoUrl} alt='Team Logo' className={styles.teamLogoPreview} />
                            <input type='file' onChange={handleFileChange} className={styles.fileInput} />
                        </div>
                    </div>
                    <label>Number of members:</label>
                    <input type='number' min='1' value={numPlayers} onChange={handleNumPlayersChange} />
                </div>
                <div className={styles.playersSection}>
                    {players.map((player, index) => (
                        <div key={index} className={styles.playerInput}>
                            <label>
                                <i class='fa-solid fa-person-circle-plus'></i> Member {index + 1}
                            </label>
                            <input
                                type='text'
                                placeholder='Member name'
                                value={player.name}
                                onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                                required
                            />
                            <input
                                type='text'
                                placeholder='Position (optional)'
                                value={player.position}
                                onChange={(e) => handlePlayerChange(index, 'position', e.target.value)}
                            />
                            <input
                                type='number'
                                placeholder='Number (optional)'
                                value={player.number}
                                onChange={(e) => handlePlayerChange(index, 'number', e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
            <div className={styles.actions}>
                <Button onClick={handleRegisterClick} className={styles.registerBtn}>
                    Register
                </Button>
                <Button onClick={handleBack} className={styles.cancelButton}>
                    Back
                </Button>
            </div>
            {isModalOpen && (
                <PaymentModal
                    isOpen={isModalOpen}
                    onClose={toggleModalOpen}
                    onSubmit={() => handleRegister()}
                    price={tournament.registrationFee || 0.0}
                    isBookingPayment={false}
                    isRegistrationPayment={true}
                ></PaymentModal>
            )}
        </div>
    );
}

export default TournamentRegister;
