import React, { useState, useEffect } from 'react';
import styles from './teamEditModal.module.scss';
import { Loading } from '../Loading/Loading';

function TeamEditModal({ isOpen, team, onClose, onSave }) {
    const [teamData, setTeamData] = useState({ ...team });
    const [previewImage, setPreviewImage] = useState(team.teamLogoUrl);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Lock scrolling when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto'; // Restore scroll when modal is closed
        }

        // Clean up on unmount or when isOpen changes
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);

            setTeamData((prevData) => ({
                ...prevData,
                teamLogoFile: file,
            }));

            setPreviewImage(imageUrl);
        }
    };

    const handleChange = (e) => {
        setTeamData({ ...teamData, [e.target.name]: e.target.value });
    };

    const handlePlayerChange = (index, key, value) => {
        const updatedPlayers = [...teamData.players];
        updatedPlayers[index][key] = value;
        setTeamData({ ...teamData, players: updatedPlayers });
    };

    const handleAddPlayer = () => {
        setTeamData({
            ...teamData,
            players: [...teamData.players, { name: '', position: '', number: '' }],
        });
    };

    const handleRemovePlayer = (index) => {
        const updatedPlayers = teamData.players.filter((_, i) => i !== index);
        setTeamData({ ...teamData, players: updatedPlayers });
    };

    const handleSubmit = (e) => {
        try {
            setIsLoading(true);
            e.preventDefault();

            const file = teamData.teamLogoFile;
            onSave(teamData, file);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            {isLoading && <Loading />}
            <div className={styles.modalContainer}>
                <span className={styles.editModalTitle}>UPDATE TEAM INFO</span>
                <div className={styles.modalContent}>
                    <form onSubmit={handleSubmit}>
                        <label>Team Name:</label>
                        <input type='text' name='teamName' value={teamData.teamName} onChange={handleChange} required />

                        <label>Team Logo:</label>
                        <div className={styles.avatarContainer}>
                            <img src={previewImage} alt='Team Logo' className={styles.avatar} />
                            <label className={styles.uploadLabel}>
                                Upload
                                <input
                                    type='file'
                                    accept='image/*'
                                    onChange={handleImageChange}
                                    className={styles.fileInput}
                                />
                            </label>
                        </div>

                        <div className={styles.playersSection}>
                            <h4>Players</h4>
                            {teamData.players.map((player, index) => (
                                <div className={styles.playerRow} key={index}>
                                    <div className={styles.inputGroup}>
                                        <input
                                            type='text'
                                            placeholder='Name'
                                            value={player.name}
                                            onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                                            required
                                            className={styles.playerNameInput}
                                        />

                                        <input
                                            type='text'
                                            placeholder='Position'
                                            value={player.position}
                                            onChange={(e) => handlePlayerChange(index, 'position', e.target.value)}
                                            className={styles.playerPositionInput}
                                        />

                                        <input
                                            type='number'
                                            placeholder='Number'
                                            value={player.number}
                                            onChange={(e) => handlePlayerChange(index, 'number', e.target.value)}
                                            className={styles.playerNumberInput}
                                        />
                                    </div>

                                    <button
                                        type='button'
                                        className={styles.removeButton}
                                        onClick={() => handleRemovePlayer(index)}
                                        title='Remove'
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}
                            <button type='button' className={styles.addButton} onClick={handleAddPlayer}>
                                + Add Player
                            </button>
                        </div>

                        <div className={styles.buttonGroup}>
                            <button type='submit' className={styles.saveButton}>
                                Save
                            </button>
                            <button type='button' className={styles.cancelButton} onClick={onClose}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default TeamEditModal;
