import { useState, useEffect } from 'react';
import styles from '../../../assets/css/Admin/manageFields.module.scss';
import Button from '../../../components/Button/Button';
import sportApi from '../../../services/api/sportApi';

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

    // Fetch danh sách môn thể thao từ API khi component mount
    useEffect(() => {
        const fetchSports = async () => {
            try {
                const response = await sportApi.getAllActive(0, 100); // Gọi API lấy danh sách môn thể thao
                setSports(response.data.content); // Cập nhật state với danh sách môn thể thao
            } catch (error) {
                console.error('Error fetching sports:', error); // Xử lý lỗi khi gọi API
            }
        };

        fetchSports();
    }, []); // useEffect chỉ chạy 1 lần khi component mount

    return (
        <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit} className={styles.inputForm}>
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

                    {/* Dropdown cho FieldType, lấy danh sách từ API */}
                    <select
                        name='fieldType'
                        value={isEditing ? editFormData.fieldType : formData.fieldType}
                        onChange={handleChange}
                        required
                    >
                        {/* Nếu chưa có dữ liệu, hiển thị "Loading..." */}
                        {sports.length === 0 ? (
                            <option value=''>Loading...</option>
                        ) : (
                            sports.map((sport) => (
                                <option key={sport.id} value={sport.sportName}>
                                    {sport.sportName}
                                </option>
                            ))
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
