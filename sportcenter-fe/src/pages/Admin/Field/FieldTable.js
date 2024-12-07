import styles from '../../../assets/css/Admin/Field/fieldTable.module.scss';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import formatCurrency from '../../../utils/formatCurrency';

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
    return (
        <table className={`mt-4 ${styles.fieldsTable}`}>
            <thead>
                <tr>
                    <th>Order</th>
                    <th>Field Name</th>
                    <th>Field Type</th>
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
                            <td>{field.fieldType}</td>
                            <td title={field.description}>{field.description}</td>

                            {/* Cột Price Policies */}
                            <td>
                                {field.pricePolicies.map((policy, policyIndex) => {
                                    // Hiển thị giá và các ngày trong tuần
                                    const daysOfWeek = policy.daysOfWeek
                                        .map((day) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day - 1])
                                        .join(', '); // Chuyển đổi từ số thành tên ngày
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
                        <td colSpan='8'>No fields available.</td> {/* Thêm colSpan cho bảng có 8 cột */}
                    </tr>
                )}
            </tbody>
        </table>
    );
}

export default FieldTable;
