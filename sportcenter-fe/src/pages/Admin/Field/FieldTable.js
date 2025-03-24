import { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../assets/css/Admin/field/fieldTable.module.scss';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import formatCurrency from '../../../utils/formatCurrency';
import sportApi from '../../../services/api/sport/sportApi';

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
    const [sports, setSports] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'fieldName', direction: 'ascending' });

    useEffect(() => {
        const fetchSports = async () => {
            try {
                const response = await sportApi.getAllActive(0, 100);
                setSports(response.data.content);
            } catch (error) {
                console.error('Error fetching sports:', error);
            }
        };

        fetchSports();
    }, []);

    const getSportNameById = (sportId) => {
        const sport = sports.find((sport) => sport.id === sportId);
        return sport ? sport.sportName : 'Unknown';
    };

    const handleSort = (key) => {
        let direction = 'descending';
        if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
        }
        setSortConfig({ key, direction });
    };

    const sortedFields = [...fields].sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'fieldName') {
            aValue = a.fieldName.toLowerCase();
            bValue = b.fieldName.toLowerCase();
        } else if (sortConfig.key === 'sportName') {
            aValue = getSportNameById(a.sportId).toLowerCase();
            bValue = getSportNameById(b.sportId).toLowerCase();
        } else if (sortConfig.key === 'pricePolicies') {
            aValue = a.pricePolicies.length;
            bValue = b.pricePolicies.length;
        } else {
            return 0;
        }

        return sortConfig.direction === 'descending'
            ? (aValue > bValue ? -1 : 1)
            : (aValue < bValue ? -1 : 1);
    });

    return (
        <table className={`mt-4 ${styles.fieldsTable}`}>
            <thead>
                <tr>
                    <th>Order</th>
                    <th onClick={() => handleSort('fieldName')} style={{ cursor: 'pointer' }}>
                        <Tooltip title="Sort by Field Name">
                            Field Name
                            <span style={{ marginLeft: '5px' }}>
                                <FontAwesomeIcon
                                    icon={faSortUp}
                                    style={{ opacity: sortConfig.key === 'fieldName' && sortConfig.direction === 'ascending' ? 1 : 0.5 }}
                                />
                                <FontAwesomeIcon
                                    icon={faSortDown}
                                    style={{ opacity: sortConfig.key === 'fieldName' && sortConfig.direction === 'descending' ? 1 : 0.5 }}
                                />
                            </span>
                        </Tooltip>
                    </th>
                    <th onClick={() => handleSort('sportName')} style={{ cursor: 'pointer' }}>
                        <Tooltip title="Sort by Sport Name">
                            Sport Name
                            <span style={{ marginLeft: '5px' }}>
                                <FontAwesomeIcon
                                    icon={faSortUp}
                                    style={{ opacity: sortConfig.key === 'sportName' && sortConfig.direction === 'ascending' ? 1 : 0.5 }}
                                />
                                <FontAwesomeIcon
                                    icon={faSortDown}
                                    style={{ opacity: sortConfig.key === 'sportName' && sortConfig.direction === 'descending' ? 1 : 0.5 }}
                                />
                            </span>
                        </Tooltip>
                    </th>
                    <th>Description</th>
                    <th onClick={() => handleSort('pricePolicies')} style={{ cursor: 'pointer' }}>
                        <Tooltip title="Sort by Price Policies">
                            Price Policies
                            <span style={{ marginLeft: '5px' }}>
                                <FontAwesomeIcon
                                    icon={faSortUp}
                                    style={{ opacity: sortConfig.key === 'pricePolicies' && sortConfig.direction === 'ascending' ? 1 : 0.5 }}
                                />
                                <FontAwesomeIcon
                                    icon={faSortDown}
                                    style={{ opacity: sortConfig.key === 'pricePolicies' && sortConfig.direction === 'descending' ? 1 : 0.5 }}
                                />
                            </span>
                        </Tooltip>
                    </th>
                    <th>Image</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {sortedFields.length > 0 ? (
                    sortedFields.map((field, index) => (
                        <tr key={field.id}>
                            <td>{index + 1 + currentPage * pageSize}</td>
                            <td>{field.fieldName}</td>
                            <td>{getSportNameById(field.sportId)}</td>
                            <td title={field.description}>{field.description}</td>
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
                        <td colSpan='7'>No fields available.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}

export default FieldTable;