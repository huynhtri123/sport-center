import { useState, useEffect } from 'react';
import { Tooltip, Select } from 'antd';
import styles from '../../../assets/css/Admin/field/fieldTable.module.scss';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import formatCurrency from '../../../utils/formatCurrency';
import sportApi from '../../../services/api/sport/sportApi';
import fieldApi from '../../../services/api/field/fieldApi';

function FieldTable({
    fields,
    setFields,
    currentPage,
    pageSize,
    handleEditClick,
    toggleModalOpen,
    isModalOpen,
    deleteFieldId,
    handleSoftDelete,
    setTotalPages,
}) {
    const [sports, setSports] = useState([]);
    const [sortOrder, setSortOrder] = useState(null);

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

    const handleSportChange = async (sportId) => {
        try {
            let response;
            if (sportId) {
                response = await fieldApi.filterBySportId(sportId, currentPage, pageSize);
            } else {
                response = await fieldApi.getAllActive(currentPage, pageSize);
            }
            setFields(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching fields:', error);
        }
    };

    const sortFieldsByPrice = (order) => {
        const sortedFields = [...fields];
        sortedFields.sort((a, b) => {
            // Lấy giá lớn nhất trong pricePolicies của mỗi trường
            const maxPriceA = Math.max(...a.pricePolicies.map((policy) => policy.price), 0);
            const maxPriceB = Math.max(...b.pricePolicies.map((policy) => policy.price), 0);

            if (order === 'asc') {
                return maxPriceA - maxPriceB; // Sắp xếp theo thứ tự tăng dần
            } else if (order === 'desc') {
                return maxPriceB - maxPriceA; // Sắp xếp theo thứ tự giảm dần
            }
            return 0;
        });
        setFields(sortedFields);
    };

    const handleSortClick = () => {
        const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newSortOrder);
        sortFieldsByPrice(newSortOrder);
    };

    return (
        <div>
            <Select
                placeholder='Filter by Sport'
                allowClear
                style={{ width: 200, marginBottom: 10 }}
                onChange={handleSportChange}
                onClear={() => handleSportChange(null)}
            >
                {sports.map((sport) => (
                    <Select.Option key={sport.id} value={sport.id}>
                        {sport.sportName}
                    </Select.Option>
                ))}
            </Select>

            <table className={`mt-4 ${styles.fieldsTable}`}>
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Field Name</th>
                        <th>Sport Name</th>
                        <th>Description</th>
                        <th>
                            Price Policies
                            {sortOrder === 'asc' ? (
                                <i
                                    className='fa-solid fa-arrow-up-short-wide ms-2'
                                    style={{ cursor: 'pointer' }}
                                    onClick={handleSortClick}
                                ></i>
                            ) : (
                                <i
                                    className='fa-solid fa-arrow-down-short-wide ms-2'
                                    style={{ cursor: 'pointer' }}
                                    onClick={handleSortClick}
                                ></i>
                            )}
                        </th>
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
                                <td>{getSportNameById(field.sportId)}</td>
                                <td title={field.description}>{field.description}</td>
                                <td>
                                    {field.pricePolicies.map((policy, policyIndex) => {
                                        const daysOfWeek = policy.daysOfWeek
                                            .map((day) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day - 1])
                                            .join(', ');

                                        return (
                                            <Tooltip
                                                key={policyIndex}
                                                title={
                                                    <>
                                                        <div>{`Price: ${formatCurrency(policy.price)}`}</div>
                                                        <div>{`Days: ${daysOfWeek}`}</div>
                                                    </>
                                                }
                                            >
                                                <div className={styles.policyContainer}>
                                                    <span>{`Price: ${formatCurrency(policy.price)}`}</span>
                                                </div>
                                            </Tooltip>
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
        </div>
    );
}

export default FieldTable;
