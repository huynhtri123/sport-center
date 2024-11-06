import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import styles from '../../assets/css/Admin/manageFields.module.scss';
import { useGetFields } from '../../customs/hooks';
import fieldApi from '../../services/api/fieldApi';
import { Loading } from '../../components/Loading/Loading';
import { FieldType } from '../../utils/enums/FieldType';
import fileApi from '../../services/api/fileApi';
import { defaultIcon } from '../../utils/defaultIcon';
import ConfirmModal from '../../components/Modal/ConfirmModal';

function ManageFields() {
    const [fields, setFields] = useGetFields();
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModalOpen = () => setIsModalOpen(!isModalOpen);

    const [formData, setFormData] = useState({
        fieldName: '',
        fieldType: FieldType.FOOTBALL,
        description: '',
        price: '',
        imageUrl: defaultIcon,
    });

    // State dùng cho chế chộ edit
    const [editFieldId, setEditFieldId] = useState(null);
    const [editFormData, setEditFormData] = useState(formData);
    const [isEditing, setIsEditing] = useState(false);

    // ẩn/hiện form input
    const [showInputForm, setShowInputForm] = useState(false);

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
                price: '',
                imageUrl: defaultIcon,
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

    // nút Add Field hoặc Cancel Edit
    const handleToggleShowAddField = () => {
        setShowInputForm(!showInputForm);
        // nếu đang trong chế độ chỉnh sửa thì đây là nút huỷ chỉnh sửa
        if (isEditing) {
            setIsEditing(false);
            setEditFieldId(null);
            setEditFormData(formData);
        }
    };

    const getFields = useCallback(async () => {
        try {
            const fieldsResponse = await fieldApi.getAllActive();
            setFields(fieldsResponse.data);
        } catch (err) {
            console.error(err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        getFields();
    }, [getFields]);

    const handleSoftDelete = async (fieldId) => {
        try {
            setIsLoading(true);
            const softDeleteResponse = await fieldApi.softDelete(fieldId);
            toast.success(softDeleteResponse.message);
            getFields();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsModalOpen(false);
        }
    };

    // bật chế độ chỉnh sửa
    const handleEditClick = (field) => {
        setIsEditing(true);
        setEditFieldId(field.id);
        setEditFormData({
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            description: field.description,
            price: field.price,
            imageUrl: field.imageUrl || defaultIcon,
        });
        setShowInputForm(true);
    };

    return (
        <div className={styles.manageFields}>
            {isLoading && <Loading />}
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
                                <option value={FieldType.BADMINTON}>Badminton</option>
                                <option value={FieldType.YOGA}>Yoga</option>
                                <option value={FieldType.TENNIS}>Tennis</option>
                            </select>
                            <input
                                type='text'
                                name='description'
                                placeholder='Description'
                                value={isEditing ? editFormData.description : formData.description}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type='number'
                                value={isEditing ? editFormData.price : formData.price}
                                name='price'
                                placeholder='Price'
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <button type='submit' className={`btn ${styles.submitButton}`}>
                        {isEditing ? 'Save Changes' : 'Create Field'}
                    </button>
                </form>
            )}
            <table className={`mt-4 ${styles.fieldsTable}`}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Field Name</th>
                        <th>Field Type</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {fields.length > 0 ? (
                        fields.map((field, index) => (
                            <tr key={field.id}>
                                <td>{index + 1}</td>
                                <td>{field.fieldName}</td>
                                <td>{field.fieldType}</td>
                                <td title={field.description}>{field.description}</td>
                                <td>${field.price}</td>
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
                                        <button className={`btn ${styles.deleteButton}`} onClick={toggleModalOpen}>
                                            Delete
                                        </button>
                                        {isModalOpen && (
                                            <ConfirmModal
                                                title='Are you sure you want to delete this field?'
                                                isOpen={isModalOpen}
                                                onClose={toggleModalOpen}
                                                onSubmit={() => handleSoftDelete(field.id)}
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

export default ManageFields;
