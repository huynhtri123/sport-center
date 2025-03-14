/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import styles from '../../../assets/css/Admin/field/manageFields.module.scss';
import { useGetFields } from '../../../customs/hooks';
import fieldApi from '../../../services/api/field/fieldApi';
import { Loading } from '../../../components/Loading/Loading';
import fileApi from '../../../services/api/file/fileApi';
import { defaultIcon } from '../../../utils/defaultIcon';
import FieldTable from './FieldTable';
import FieldInput from './FieldInput';

function ManageFields() {
    const [fields, setFields] = useGetFields();
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteFieldId, setDeleteFieldId] = useState(null);
    const [formData, setFormData] = useState({
        fieldName: '',
        sportId: '', // Changed from fieldType
        description: '',
        imageUrl: defaultIcon,
        videoUrl: defaultIcon,
        pricePolicies: [{ price: 0, daysOfWeek: [] }], // Default days
    });
    const [editFieldId, setEditFieldId] = useState(null);
    const [editFormData, setEditFormData] = useState(formData);
    const [isEditing, setIsEditing] = useState(false);
    const [showInputForm, setShowInputForm] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSportId, setSelectedSportId] = useState(''); // Changed from selectedFieldType

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
        // console.log(name + ':' + value);
        if (name === 'searchQuery') {
            setSearchQuery(value);
            setCurrentPage(0); // Reset page to 0 on new search
        } else if (isEditing) {
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

    const handleChangeVideoFile = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setIsLoading(true);
                const response = await fileApi.uploadVideo(file);
                if (isEditing) {
                    setEditFormData((prevState) => ({ ...prevState, videoUrl: response.data.url }));
                } else {
                    setFormData((prevState) => ({ ...prevState, videoUrl: response.data.url }));
                }
                toast.success(response.message);
            } catch (error) {
                console.error('Upload video failed:', error);
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
                sportId: '', // Reset sportId
                description: '',
                imageUrl: defaultIcon,
                videoUrl: defaultIcon,
                pricePolicies: [{ price: 0, daysOfWeek: [] }],
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
            const fieldsResponse = await fieldApi.searchByNameAndPaginate(searchQuery, currentPage, pageSize);
            setFields(fieldsResponse.data.content);
            setTotalPages(fieldsResponse.data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, searchQuery, setFields]);

    useEffect(() => {
        getFields();
    }, [getFields, searchQuery]);

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
            sportId: field.sportId, // Changed from fieldType
            description: field.description,
            imageUrl: field.imageUrl || defaultIcon,
            videoUrl: field.videoUrl || defaultIcon,
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

    // Filter fields based on search query and selected sportId
    const filteredFields = fields.filter((field) => {
        const matchesName = field.fieldName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesName;
    });

    return (
        <div className={styles.manageFields}>
            {isLoading && <Loading />}
            <div className={styles.searchContainer}>
                <input
                    type='text'
                    name='searchQuery'
                    placeholder='Search by name...'
                    value={searchQuery}
                    onChange={handleChange}
                    className={styles.searchInput}
                />
            </div>
            <button className={`btn ${styles.addButton}`} onClick={handleToggleShowAddField}>
                {isEditing ? 'Cancel Edit' : 'Add New Field'}
            </button>
            {(showInputForm || isEditing) && (
                <FieldInput
                    isEditing={isEditing}
                    handleEditSubmit={handleEditSubmit}
                    handleAddSubmit={handleAddSubmit}
                    editFormData={editFormData}
                    formData={formData}
                    handleChangeFile={handleChangeFile}
                    handleChangeVideoFile={handleChangeVideoFile}
                    handleChange={handleChange}
                    handlePricePolicyChange={handlePricePolicyChange}
                    handleDayOfWeekChange={handleDayOfWeekChange}
                    handleRemovePricePolicy={handleRemovePricePolicy}
                    handleAddPricePolicy={handleAddPricePolicy}
                />
            )}

            <FieldTable
                fields={fields}
                currentPage={currentPage}
                pageSize={pageSize}
                handleEditClick={handleEditClick}
                toggleModalOpen={toggleModalOpen}
                isModalOpen={isModalOpen}
                deleteFieldId={deleteFieldId}
                handleSoftDelete={handleSoftDelete}
            />

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
