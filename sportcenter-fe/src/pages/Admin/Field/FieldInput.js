import { useState, useEffect } from 'react';
import styles from '../../../assets/css/Admin/field/manageFields.module.scss';
import Button from '../../../components/Button/Button';
import sportApi from '../../../services/api/sport/sportApi';
import { toast } from 'react-toastify';

function FieldInput({
    isEditing,
    handleEditSubmit,
    handleAddSubmit,
    editFormData,
    formData,
    handleChangeFile,
    handleChangeVideoFile,
    handleChange,
    handlePricePolicyChange,
    handleDayOfWeekChange,
    handleRemovePricePolicy,
    handleAddPricePolicy,
}) {
    const [sports, setSports] = useState([]); // State chứa danh sách môn thể thao
    const [errors, setErrors] = useState({}); // State chứa lỗi form

    // Fetch danh sách môn thể thao từ API khi component mount
    useEffect(() => {
        const fetchSports = async () => {
            try {
                const response = await sportApi.getAllActive(0, 100); // Gọi API lấy danh sách môn thể thao
                console.log(response.data.content);
                setSports(response.data.content); // Cập nhật state với danh sách môn thể thao
            } catch (error) {
                console.error('Error fetching sports:', error); // Xử lý lỗi khi gọi API
            }
        };

        fetchSports();
    }, []); // useEffect chỉ chạy 1 lần khi component mount

    // Kiểm tra xem có ít nhất một ngày được chọn trong policy không
    const validateForm = () => {
        let formIsValid = true;
        let errorMessages = {};

        (isEditing ? editFormData.pricePolicies : formData.pricePolicies).forEach((policy, index) => {
            if (policy.daysOfWeek.length === 0) {
                formIsValid = false;
                toast.warn('Please select at least one day for price policy.');
            }
        });

        setErrors(errorMessages);
        return formIsValid;
    };

    // Hàm submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Nếu form hợp lệ, gọi handleAddSubmit hoặc handleEditSubmit
            isEditing ? handleEditSubmit(e) : handleAddSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.inputForm}>
            <div className={styles.formContainer}>
                <div className={styles.mediaContainer}>
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
                            Upload Image
                        </label>
                    </div>
                    <div className={styles.videoContainer}>
                        <video
                            src={isEditing ? editFormData.videoUrl : formData.videoUrl}
                            className={styles.video}
                            controls
                            alt='Uploaded Video'
                        />
                        <label className={styles.uploadLabel}>
                            <input
                                type='file'
                                name='videoUrl'
                                accept='video/*'
                                onChange={handleChangeVideoFile}
                                className={styles.fileInput}
                            />
                            Upload Video
                        </label>
                    </div>
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

                    {/* Dropdown cho sportId, lấy danh sách từ API */}
                    <select
                        name='sportId'
                        value={isEditing ? editFormData.sportId : formData.sportId}
                        onChange={handleChange}
                        required
                    >
                        {sports.length === 0 ? (
                            <option value=''>Loading...</option>
                        ) : (
                            <>
                                <option value=''>Please select a sport</option>
                                {sports.map((sport) => (
                                    <option key={sport.id} value={sport.id}>
                                        {sport.sportName}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>

                    <input
                        type='text'
                        name='description'
                        value={isEditing ? editFormData.description : formData.description}
                        placeholder='Description'
                        onChange={handleChange}
                        required
                    />

                    {/* Các phần khác của form */}
                    {(isEditing ? editFormData.pricePolicies : formData.pricePolicies).map((policy, index) => (
                        <div key={index} className={styles.pricePolicyContainer}>
                            <input
                                type='number'
                                name='price'
                                value={policy.price}
                                placeholder='Price'
                                onChange={(e) => handlePricePolicyChange(e, index)}
                                required
                                min='0'
                                step='any' // Cho phép nhập số thập phân
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
                                                'Saturday',
                                                'Sunday',
                                            ][dayIndex]
                                        }
                                    </label>
                                ))}
                            </div>
                            {/* Hiển thị lỗi nếu không có ngày nào được chọn */}
                            {errors[`policy-${index}`] && (
                                <span className={styles.errorText}>{errors[`policy-${index}`]}</span>
                            )}
                            <button
                                type='button'
                                className={`btn ${styles.removePolicyButton}`}
                                onClick={() => handleRemovePricePolicy(index)}
                            >
                                Remove Policy
                            </button>
                        </div>
                    ))}
                    <button type='button' className={`btn ${styles.addPolicyButton}`} onClick={handleAddPricePolicy}>
                        More Price Policy
                    </button>
                </div>
            </div>

            <Button type='submit' className={`btn ${styles.submitButton}`}>
                {isEditing ? 'Save Changes' : 'Create Field'}
            </Button>
        </form>
    );
}

export default FieldInput;
