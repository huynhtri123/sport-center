import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../../../assets/css/Tournament/tournamentRegister.module.scss';
import Button from '../../../components/Button/Button';
import tournamentApi from '../../../services/api/tournamentApi';
import { useTournament } from '../../../customs/hooks';
import teamApi from '../../../services/api/teamApi';
import { Loading } from '../../../components/Loading/Loading';
import PaymentModal from '../../../components/Modal/PaymentModal';
import { defaultIcon } from '../../../utils/defaultIcon';

function TournamentRegister() {
    const [tournament] = useTournament();
    const [teamName, setTeamName] = useState('');
    const [teamLogoUrl, setTeamLogoUrl] = useState(null); // file truyền đi
    const [previewImage, setPreviewImage] = useState(defaultIcon);
    const [numPlayers, setNumPlayers] = useState(1);
    const [players, setPlayers] = useState([{ name: '', position: '', number: '' }]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const toggleModalOpen = () => {
        setIsModalOpen(!isModalOpen);
    };

    const checkExistedTeam = async () => {
        try {
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
            setErrorMessage('You have not entered a team name!');
            return false;
        }
        const allPlayersValid = players.every((player) => player.name.trim() !== '');
        if (!allPlayersValid) {
            setErrorMessage('All members must have a name!');
            return false;
        }
        setErrorMessage(''); // Xóa lỗi nếu hợp lệ
        return true;
    };

    const handleNumPlayersChange = (e) => {
        const count = parseInt(e.target.value, 10) || 0;

        // Giới hạn số lượng thành viên tối đa là 16
        if (count > 16) {
            setNumPlayers(16);
            return;
        }

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file); // Tạo URL cho file ảnh ddeer preview

            setPreviewImage(imageUrl); // preview

            setTeamLogoUrl(file); // file
        }
    };

    const handleRegister = async () => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            const teamRequest = {
                teamName,
                players,
            };

            const registerRequest = {
                tournamentId: tournament.id,
                teamRequest: teamRequest,
            };
            formData.append('request', new Blob([JSON.stringify(registerRequest)], { type: 'application/json' }));
            if (teamLogoUrl) {
                formData.append('file', teamLogoUrl);
            }
            const registerResponse = await tournamentApi.register(formData);
            // toast.success(registerResponse.message);
            localStorage.setItem('selectedTournament', JSON.stringify(registerResponse.data));
            //navigate('/tournament/detail');
            return registerResponse.data;
        } catch (error) {
            console.error('Registration failed:', error);
            setErrorMessage('An error occurred, please try again!');
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
                        <i className='fa-solid fa-signature'></i> Team Name:
                    </label>
                    <input
                        type='text'
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder='Enter your team name...'
                        required
                    />
                    <label>
                        <i className='fa-regular fa-image'></i> Team Logo:
                    </label>
                    <div className={styles.logoUpload}>
                        <div className={styles.logoWrapper}>
                            <img src={previewImage} alt='Team Logo' className={styles.teamLogoPreview} />
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleImageChange}
                                className={styles.fileInput}
                            />
                        </div>
                    </div>
                    <label>Number of members:</label>
                    <input
                        type='number'
                        min='1'
                        max='16' // Giới hạn tối đa là 16
                        value={numPlayers}
                        onChange={handleNumPlayersChange}
                    />
                </div>
                <div className={styles.playersSection}>
                    {players.map((player, index) => (
                        <div key={index} className={styles.playerInput}>
                            <label>
                                <i className='fa-solid fa-person-circle-plus'></i> Member {index + 1}
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
