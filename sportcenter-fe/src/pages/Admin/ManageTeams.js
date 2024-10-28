import React, { useState, useEffect } from 'react';
import teamApi from '../../services/api/teamApi'; // Update with your actual API service
import styles from '../../assets/css/manageTeams.module.scss'; // Create this CSS file
import { toast } from 'react-toastify';

function ManageTeams() {
    const [teams, setTeams] = useState([]);
    const [newTeam, setNewTeam] = useState({ teamName: '', description: '', logoUrl: '' });
    const [editingTeam, setEditingTeam] = useState(null);

    // Fetch the teams data from the API when the component mounts
    useEffect(() => {
        fetchTeams();
    }, []);

    async function fetchTeams() {
        try {
            const response = await teamApi.getAll();
            setTeams(response.data);
        } catch (error) {
            console.error("Failed to fetch teams:", error);
            toast.error("Failed to fetch teams. Please try again.");
        }
    }

    const handleAddTeam = async () => {
        try {
            const response = await teamApi.create(newTeam);
            setTeams([...teams, response.data]);
            toast.success("Team added successfully!");
            setNewTeam({ teamName: '', description: '', logoUrl: '' });
        } catch (error) {
            console.error("Failed to add team:", error);
            toast.error("Failed to add team. Please try again.");
        }
    };

    const handleEditTeam = (team) => {
        setEditingTeam(team);
    };

    const handleUpdateTeam = async () => {
        try {
            const response = await teamApi.update(editingTeam.id, editingTeam);
            setTeams(teams.map(team => (team.id === editingTeam.id ? response.data : team)));
            toast.success("Team updated successfully!");
            setEditingTeam(null);
        } catch (error) {
            console.error("Failed to update team:", error);
            toast.error("Failed to update team. Please try again.");
        }
    };

    const handleDeleteTeam = async (teamId) => {
        try {
            await teamApi.softDelete(teamId);
            setTeams(teams.filter(team => team.id !== teamId));
            toast.success("Team deleted successfully!");
        } catch (error) {
            console.error("Failed to delete team:", error);
            toast.error("Failed to delete team. Please try again.");
        }
    };

    return (
        <div className={styles.manageTeams}>
            <h2>Manage Teams</h2>
            <table className={styles.teamsTable}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Team Name</th>
                        <th>Description</th>
                        <th>Logo</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {teams.map((team, index) => (
                        <tr key={team.id}>
                            <td>{index + 1}</td>
                            <td>{team.teamName}</td>
                            <td>{team.description}</td>
                            <td>
                                <img src={team.logoUrl} alt={team.teamName} className={styles.teamLogo} />
                            </td>
                            <td>
                                <button className={`btn ${styles.editButton}`} onClick={() => handleEditTeam(team)}>Edit</button>
                                <button className={`btn ${styles.deleteButton}`} onClick={() => handleDeleteTeam(team.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={styles.formContainer}>
                <h3>{editingTeam ? "Edit Team" : "Add New Team"}</h3>
                <input
                    type="text"
                    placeholder="Team Name"
                    value={editingTeam ? editingTeam.teamName : newTeam.teamName}
                    onChange={(e) => editingTeam ? setEditingTeam({ ...editingTeam, teamName: e.target.value }) : setNewTeam({ ...newTeam, teamName: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={editingTeam ? editingTeam.description : newTeam.description}
                    onChange={(e) => editingTeam ? setEditingTeam({ ...editingTeam, description: e.target.value }) : setNewTeam({ ...newTeam, description: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Logo URL"
                    value={editingTeam ? editingTeam.logoUrl : newTeam.logoUrl}
                    onChange={(e) => editingTeam ? setEditingTeam({ ...editingTeam, logoUrl: e.target.value }) : setNewTeam({ ...newTeam, logoUrl: e.target.value })}
                />
                <button
                    className={`btn ${styles.addButton}`}
                    onClick={editingTeam ? handleUpdateTeam : handleAddTeam}
                >
                    {editingTeam ? "Update Team" : "Add Team"}
                </button>
                {editingTeam && (
                    <button className="btn" onClick={() => setEditingTeam(null)}>Cancel</button>
                )}
            </div>
        </div>
    );
}

export default ManageTeams;
