import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import styles from '../../assets/css/Admin/manageFields.module.scss';
import { useGetFields } from '../../customs/hooks';
import fieldApi from '../../services/api/fieldApi';
import { Loading } from '../../components/Loading/Loading';
import { FieldType } from '../../utils/enums/FieldType';
import fileApi from '../../services/api/fileApi';
import { defaultIcon } from '../../utils/defaultIcon';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import Button from '../../components/Button/Button';

function ManageFields() {
    const [fields, setFields] = useGetFields();
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteFieldId, setDeleteFieldId] = useState(null);
    const [formData, setFormData] = useState({
        fieldName: '',
        fieldType: FieldType.FOOTBALL,
        description: '',
        imageUrl: defaultIcon,
        pricePolicies: [{ price: '', daysOfWeek: [] }], // Default days
    });
    const [editFieldId, setEditFieldId] = useState(null);
    const [editFormData, setEditFormData] = useState(formData);
    const [isEditing, setIsEditing] = useState(false);
    const [showInputForm, setShowInputForm] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFieldType, setSelectedFieldType] = useState(FieldType.FOOTBALL);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(0);

    const toggleModalOpen = (fieldId = null) => {
        setDeleteFieldId(fieldId);
        setIsModalOpen(!isModalOpen);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (isEditing) {
            setEditFormData((prevData) => ({ ...prevData, [name]: value }));
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }
    };

    const handleChangeFile = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setIsLoading(true);
                const response = await fileApi.uploadImage(file);
                if (isEditing) {
                    setEditFormData((prevState) => ({ ...prevState, imageUrl: response.data.url }));
                } else {
                    setFormData((prevState) => ({ ...prevState, imageUrl: response.data.url }));
                }
            } catch (error) {
                console.error('Upload failed:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const createFieldResponse = await fieldApi.create(formData);
            toast.success(createFieldResponse.message);
            getFields();
            setFormData({
                fieldName: '',
                fieldType: FieldType.FOOTBALL,
                description: '',
                imageUrl: defaultIcon,
                pricePolicies: [{ price: '', daysOfWeek: [] }], // Default days
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const editResponse = await fieldApi.update(editFieldId, editFormData);
            toast.success(editResponse.message);
            getFields();
            setIsEditing(false);
            setEditFieldId(null);
            setEditFormData(formData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleShowAddField = () => {
        setShowInputForm(!showInputForm);
        if (isEditing) {
            setIsEditing(false);
            setEditFieldId(null);
            setEditFormData(formData);
        }
    };

    const getFields = useCallback(async () => {
        try {
            setIsLoading(true);
            const fieldsResponse = await fieldApi.getAllActive(currentPage, pageSize);
            setFields(fieldsResponse.data.content);
            setTotalPages(fieldsResponse.data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, setFields]);

    useEffect(() => {
        getFields();
    }, [getFields]);

    const handleSoftDelete = async () => {
        if (!deleteFieldId) return;
        try {
            setIsLoading(true);
            const softDeleteResponse = await fieldApi.softDelete(deleteFieldId);
            toast.success(softDeleteResponse.message);
            getFields();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsModalOpen(false);
        }
    };

    const handleEditClick = (field) => {
        setIsEditing(true);
        setEditFieldId(field.id);
        setEditFormData({
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            description: field.description,
            imageUrl: field.imageUrl || defaultIcon,
            pricePolicies: field.pricePolicies || [{ price: '', daysOfWeek: [] }],
        });
        setShowInputForm(true);
    };

    const handlePricePolicyChange = (e, index) => {
        const { name, value } = e.target;
        const updatedPricePolicies = [...(isEditing ? editFormData.pricePolicies : formData.pricePolicies)];
        updatedPricePolicies[index] = { ...updatedPricePolicies[index], [name]: value };
        if (isEditing) {
            setEditFormData((prevState) => ({ ...prevState, pricePolicies: updatedPricePolicies }));
        } else {
            setFormData((prevState) => ({ ...prevState, pricePolicies: updatedPricePolicies }));
        }
    };

    const handleAddPricePolicy = () => {
        const newPricePolicy = { price: '', daysOfWeek: [] };
        if (isEditing) {
            setEditFormData((prevState) => ({
                ...prevState,
                pricePolicies: [...prevState.pricePolicies, newPricePolicy],
            }));
        } else {
            setFormData((prevState) => ({
                ...prevState,
                pricePolicies: [...prevState.pricePolicies, newPricePolicy],
            }));
        }
    };

    const handleRemovePricePolicy = (index) => {
        const updatedPricePolicies = (isEditing ? editFormData.pricePolicies : formData.pricePolicies).filter(
            (_, i) => i !== index
        );
        if (isEditing) {
            setEditFormData((prevState) => ({ ...prevState, pricePolicies: updatedPricePolicies }));
        } else {
            setFormData((prevState) => ({ ...prevState, pricePolicies: updatedPricePolicies }));
        }
    };

    const handleDayOfWeekChange = (e, index) => {
        const { value, checked } = e.target;
        const updatedPricePolicies = [...(isEditing ? editFormData.pricePolicies : formData.pricePolicies)];
        const selectedDay = parseInt(value, 10);
        if (checked) {
            updatedPricePolicies[index].daysOfWeek.push(selectedDay);
        } else {
            updatedPricePolicies[index].daysOfWeek = updatedPricePolicies[index].daysOfWeek.filter(
                (day) => day !== selectedDay
            );
        }
        if (isEditing) {
            setEditFormData((prevState) => ({ ...prevState, pricePolicies: updatedPricePolicies }));
        } else {
            setFormData((prevState) => ({ ...prevState, pricePolicies: updatedPricePolicies }));
        }
    };

    // Filter fields based on search query and selected field type
    const filteredFields = fields.filter((field) => {
        const matchesName = field.fieldName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = field.fieldType === selectedFieldType;
        return matchesName && matchesType;
    });

    return (
        <div className={styles.manageFields}>
            {isLoading && <Loading />}
            <div className={styles.searchContainer}>
                <input
                    type='text'
                    placeholder='Search by name...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
                <select
                    value={selectedFieldType}
                    onChange={(e) => setSelectedFieldType(e.target.value)}
                    className={styles.fieldTypeSelect}
                >
                    <option value={FieldType.FOOTBALL}>Football</option>
                    <option value={FieldType.TENNIS}>Tennis</option>
                    <option value={FieldType.BADMINTON}>Badminton</option>
                    <option value={FieldType.YOGA}>Yoga</option>
                </select>
            </div>
            <button className={`btn ${styles.addButton}`} onClick={handleToggleShowAddField}>
                {isEditing ? 'Cancel Edit' : 'Add New Field'}
            </button>
            {(showInputForm || isEditing) && (
                <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit} className={styles.inputForm}>
                    <div className={styles.formContainer}>
                        <div className={styles.avatarContainer}>
                            <img
                                src={isEditing ? editFormData.imageUrl : formData.imageUrl}
                                alt='Avatar'
                                className={styles.avatar}
                            />
                            <label className={styles.uploadLabel}>
                                <input
                                    type='file'
                                    name='imageUrl'
                                    accept='image/*'
                                    onChange={handleChangeFile}
                                    className={styles.fileInput}
                                />
                                Upload
                            </label>
                        </div>
                        <div className={styles.inputsContainer}>
                            <input
                                type='text'
                                name='fieldName'
                                value={isEditing ? editFormData.fieldName : formData.fieldName}
                                placeholder='Field Name'
                                onChange={handleChange}
                                required
                            />
                            <select
                                name='fieldType'
                                value={isEditing ? editFormData.fieldType : formData.fieldType}
                                onChange={handleChange}
                                required
                            >
                                <option value={FieldType.FOOTBALL}>Football</option>
                                <option value={FieldType.TENNIS}>Tennis</option>
                                <option value={FieldType.BADMINTON}>Tennis</option>
                                <option value={FieldType.YOGA}>Tennis</option>
                            </select>
                            <input
                                type='text'
                                name='description'
                                value={isEditing ? editFormData.description : formData.description}
                                placeholder='Description'
                                onChange={handleChange}
                                required
                            />
                            {(isEditing ? editFormData.pricePolicies : formData.pricePolicies).map((policy, index) => (
                                <div key={index} className={styles.pricePolicyContainer}>
                                    <input
                                        type='number'
                                        name='price'
                                        value={policy.price}
                                        placeholder='Price'
                                        onChange={(e) => handlePricePolicyChange(e, index)}
                                        required
                                    />
                                    <div className={styles.dayOfWeekContainer}>
                                        {Array.from({ length: 7 }).map((_, dayIndex) => (
                                            <label key={dayIndex} className={styles.dayOfWeekLabel}>
                                                <input
                                                    type='checkbox'
                                                    value={dayIndex + 1}
                                                    checked={policy.daysOfWeek.includes(dayIndex + 1)}
                                                    onChange={(e) => handleDayOfWeekChange(e, index)}
                                                />
                                                {
                                                    [
                                                        'Monday',
                                                        'Tuesday',
                                                        'Wednesday',
                                                        'Thursday',
                                                        'Friday',
                                                        'Sartuday',
                                                        'Sunday',
                                                    ][dayIndex]
                                                }
                                            </label>
                                        ))}
                                    </div>
                                    <button
                                        type='button'
                                        className={`btn ${styles.removePolicyButton}`}
                                        onClick={() => handleRemovePricePolicy(index)}
                                    >
                                        Remove Policy
                                    </button>
                                </div>
                            ))}
                            <button
                                type='button'
                                className={`btn ${styles.addPolicyButton}`}
                                onClick={handleAddPricePolicy}
                            >
                                More Price Policy
                            </button>
                        </div>
                    </div>
                    <Button type='submit' className={`btn ${styles.submitButton}`}>
                        {isEditing ? 'Save Changes' : 'Create Field'}
                    </Button>
                </form>
            )}
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
                    {filteredFields.length > 0 ? (
                        filteredFields.map((field, index) => (
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
                                                <span>{`Price: $${policy.price}`}</span>
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
            <div className={styles.pagination}>
                <button disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>
                    Previous
                </button>
                <span>{`Page ${currentPage + 1} of ${totalPages}`}</span>
                <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default ManageFields;
