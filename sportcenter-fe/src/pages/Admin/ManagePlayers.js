import React, { useEffect, useState } from 'react';
import playerApi from '../../services/api/playerApi'; // Adjust the path as needed
import styles from '../../assets/css/managePlayers.module.scss';
import { toast } from 'react-toastify';

function ManagePlayers() {
    const [players, setPlayers] = useState([]);
    const [newPlayer, setNewPlayer] = useState({ name: '', position: '', number: '' });
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch all players when the component mounts
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await playerApi.getAllPlayers();
                if (response.data) {
                    setPlayers(response.data); // Set the players to the state
                }
            } catch (err) {
                setError(err.message);
                toast.error("Failed to fetch players. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    const handleAddPlayer = async () => {
        try {
            const response = await playerApi.create(newPlayer); // Use 'create' here
            setPlayers([...players, response.data]); // Add the new player to the list
            toast.success("Player added successfully!");
            setNewPlayer({ name: '', position: '', number: '' }); // Reset form
        } catch (error) {
            console.error("Failed to add player:", error.response || error);
            toast.error("Failed to add player. Please try again.");
        }
    };

    const handleEditPlayer = (player) => {
        setEditingPlayer(player); // Set player to be edited
        setNewPlayer({ name: player.name, position: player.position, number: player.number }); // Populate form for editing
    };

    const handleUpdatePlayer = async () => {
        try {
            const response = await playerApi.update(editingPlayer.id, newPlayer); // Use updated player data
            setPlayers(players.map(player => (player.id === editingPlayer.id ? response.data : player)));
            toast.success("Player updated successfully!");
            setEditingPlayer(null); // Reset editing state
            setNewPlayer({ name: '', position: '', number: '' }); // Reset form
        } catch (error) {
            console.error("Failed to update player:", error);
            toast.error("Failed to update player. Please try again.");
        }
    };

    const handleDelete = async (playerId) => {
        try {
            await playerApi.softDelete(playerId); // Use 'softDelete' here
            setPlayers(players.filter(player => player.id !== playerId)); // Remove player from state
            toast.success("Player deleted successfully!");
        } catch (err) {
            setError(err.message);
            toast.error("Failed to delete player. Please try again.");
        }
    };

    if (loading) return <p>Loading players...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className={styles.managePlayers}>
            <h2>Manage Players</h2>
            <table className={styles.playersTable}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Player Name</th>
                        <th>Position</th>
                        <th>Number</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((player, index) => (
                        <tr key={player.id}>
                            <td>{index + 1}</td>
                            <td>{player.name}</td>
                            <td>{player.position || 'N/A'}</td>
                            <td>{player.number || 'N/A'}</td>
                            <td>
                                <button className={`btn ${styles.editButton}`} onClick={() => handleEditPlayer(player)}>Edit</button>
                                <button className={`btn ${styles.deleteButton}`} onClick={() => handleDelete(player.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={styles.formContainer}>
                <h3>{editingPlayer ? "Edit Player" : "Add New Player"}</h3>
                <input
                    type="text"
                    placeholder="Player Name"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Position"
                    value={newPlayer.position}
                    onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Number"
                    value={newPlayer.number}
                    onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                />
                <button
                    className={`btn ${styles.addButton}`}
                    onClick={editingPlayer ? handleUpdatePlayer : handleAddPlayer}
                >
                    {editingPlayer ? "Update Player" : "Add Player"}
                </button>
                {editingPlayer && (
                    <button className="btn" onClick={() => setEditingPlayer(null)}>Cancel</button>
                )}
            </div>
        </div>
    );
}

export default ManagePlayers;
