import React, { useState, useEffect } from 'react';
import sportApi from '../../services/api/sportApi';
import styles from '../../assets/css/Admin/manageSports.module.scss';
import { toast } from 'react-toastify';

function ManageSports() {
    const [sports, setSports] = useState([]);
    const [newSport, setNewSport] = useState({ sportName: '', description: '', imageUrl: '' });
    const [editingSport, setEditingSport] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false); // State for form visibility

    useEffect(() => {
        fetchSports();
    }, []);

    async function fetchSports() {
        try {
            const response = await sportApi.getAllActive();
            setSports(response.data);
        } catch (error) {
            console.error("Failed to fetch sports:", error);
            toast.error("Failed to fetch sports. Please try again.");
        }
    }

    const handleAddSport = async () => {
        try {
            const response = await sportApi.create(newSport);
            setSports([...sports, response.data]);
            toast.success("Sport added successfully!");
            setNewSport({ sportName: '', description: '', imageUrl: '' });
            setIsFormVisible(false); // Hide form after adding
        } catch (error) {
            console.error("Failed to add sport:", error.response || error);
            toast.error("Failed to add sport. Please try again.");
        }
    };

    const handleEditSport = (sport) => {
        setEditingSport(sport);
        setIsFormVisible(true); // Show form when editing
    };

    const handleUpdateSport = async () => {
        try {
            const response = await sportApi.update(editingSport.id, editingSport);
            setSports(sports.map(sport => (sport.id === editingSport.id ? response.data : sport)));
            toast.success("Sport updated successfully!");
            setEditingSport(null);
            setIsFormVisible(false); // Hide form after updating
        } catch (error) {
            console.error("Failed to update sport:", error.response ? error.response.data : error.message);
            toast.error("Failed to update sport. Please try again.");
        }
    };

    const handleDeleteSport = async (sportId) => {
        try {
            await sportApi.softDelete(sportId);
            setSports(sports.filter(sport => sport.id !== sportId));
            toast.success("Sport deleted successfully!");
        } catch (error) {
            console.error("Failed to delete sport:", error.response || error);
            toast.error("Failed to delete sport. Please try again.");
        }
    };

    return (
        <div className={styles.manageSports}>
            <h2>Manage Sports</h2>
            <table className={styles.sportsTable}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Sport Name</th>
                        <th>Description</th>
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sports.map((sport, index) => (
                        <tr key={sport.id}>
                            <td>{index + 1}</td>
                            <td>{sport.sportName}</td>
                            <td>{sport.description}</td>
                            <td>
                                <img src={sport.imageUrl} alt={sport.sportName} className={styles.sportImage} />
                            </td>
                            <td>
                                <button className={`btn ${styles.editButton}`} onClick={() => handleEditSport(sport)}>Edit</button>
                                <button className={`btn ${styles.deleteButton}`} onClick={() => handleDeleteSport(sport.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button 
                className={`btn ${styles.addButton}`} 
                onClick={() => setIsFormVisible(prev => !prev)}
            >
                {isFormVisible ? "Cancel" : "Add New Sport"}
            </button>

            {isFormVisible && ( // Conditional rendering of the form
                <div className={styles.formContainer}>
                    <h3>{editingSport ? "Edit Sport" : "Add New Sport"}</h3>
                    <input
                        type="text"
                        placeholder="Sport Name"
                        value={editingSport ? editingSport.sportName : newSport.sportName}
                        onChange={(e) => editingSport ? setEditingSport({ ...editingSport, sportName: e.target.value }) : setNewSport({ ...newSport, sportName: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={editingSport ? editingSport.description : newSport.description}
                        onChange={(e) => editingSport ? setEditingSport({ ...editingSport, description: e.target.value }) : setNewSport({ ...newSport, description: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Image URL"
                        value={editingSport ? editingSport.imageUrl : newSport.imageUrl}
                        onChange={(e) => editingSport ? setEditingSport({ ...editingSport, imageUrl: e.target.value }) : setNewSport({ ...newSport, imageUrl: e.target.value })}
                    />
                    <button
                        className={`btn ${styles.addButton}`}
                        onClick={editingSport ? handleUpdateSport : handleAddSport}
                    >
                        {editingSport ? "Update Sport" : "Add Sport"}
                    </button>
                    {editingSport && (
                        <button className="btn" onClick={() => setEditingSport(null)}>Cancel Edit</button>
                    )}
                </div>
            )}
        </div>
    );
}

export default ManageSports;