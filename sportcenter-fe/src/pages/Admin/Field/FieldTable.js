import { useState, useEffect } from 'react';
import styles from '../../../assets/css/Admin/Field/fieldTable.module.scss';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import formatCurrency from '../../../utils/formatCurrency';
import sportApi from '../../../services/api/sportApi'; // Make sure to import your sport API service

function FieldTable({
    fields,
    currentPage,
    pageSize,
    handleEditClick,
    toggleModalOpen,
    isModalOpen,
    deleteFieldId,
    handleSoftDelete,
}) {
    const [sports, setSports] = useState([]); // State to hold sports data

    // Fetch all sports data
    useEffect(() => {
        const fetchSports = async () => {
            try {
                const response = await sportApi.getAllActive(0, 100); // Adjust the API call as per your service
                setSports(response.data.content); // Set the sports data
            } catch (error) {
                console.error('Error fetching sports:', error);
            }
        };

        fetchSports();
    }, []); // Empty dependency array to run once on mount

    // Function to get sport name by sportId
    const getSportNameById = (sportId) => {
        const sport = sports.find((sport) => sport.id === sportId);
        return sport ? sport.sportName : 'Unknown'; // Return 'Unknown' if not found
    };

    return (
        <table className={`mt-4 ${styles.fieldsTable}`}>
            <thead>
                <tr>
                    <th>Order</th>
                    <th>Field Name</th>
                    <th>Sport Name</th> {/* Changed to Sport Name */}
                    <th>Description</th>
                    <th>Price Policies</th>
                    <th>Image</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {fields.length > 0 ? (
                    fields.map((field, index) => (
                        <tr key={field.id}>
                            <td>{index + 1 + currentPage * pageSize}</td>
                            <td>{field.fieldName}</td>
                            <td>{getSportNameById(field.sportId)}</td> {/* Displaying sportName */}
                            <td title={field.description}>{field.description}</td>
                            {/* Cột Price Policies */}
                            <td>
                                {field.pricePolicies.map((policy, policyIndex) => {
                                    const daysOfWeek = policy.daysOfWeek
                                        .map((day) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day - 1])
                                        .join(', ');
                                    return (
                                        <div key={policyIndex} className={styles.policyContainer}>
                                            <span>{`Price: $${formatCurrency(policy.price)}`}</span>
                                            <br />
                                            <span>{`Days: ${daysOfWeek}`}</span>
                                        </div>
                                    );
                                })}
                            </td>
                            <td>
                                <img src={field.imageUrl} alt={field.fieldName} className={styles.fieldImage} />
                            </td>
                            <td>
                                <div className={styles.actionButtons}>
                                    <button
                                        className={`btn ${styles.editButton}`}
                                        onClick={() => handleEditClick(field)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={`btn ${styles.deleteButton}`}
                                        onClick={() => toggleModalOpen(field.id)}
                                    >
                                        Delete
                                    </button>
                                    {isModalOpen && deleteFieldId === field.id && (
                                        <ConfirmModal
                                            title='Are you sure you want to delete this field?'
                                            isOpen={isModalOpen}
                                            onClose={() => toggleModalOpen(null)}
                                            onSubmit={handleSoftDelete}
                                        />
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan='7'>No fields available.</td> {/* Adjusted colSpan to match table columns */}
                    </tr>
                )}
            </tbody>
        </table>
    );
}

export default FieldTable;
