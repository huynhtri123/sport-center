import styles from '../../../assets/css/Admin/manageFields.module.scss';
import { FieldType } from '../../../utils/enums/FieldType';
import Button from '../../../components/Button/Button';

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
                    <select
                        name='fieldType'
                        value={isEditing ? editFormData.fieldType : formData.fieldType}
                        onChange={handleChange}
                        required
                    >
                        <option value={FieldType.FOOTBALL}>Football</option>
                        <option value={FieldType.TENNIS}>Tennis</option>
                        <option value={FieldType.BADMINTON}>Badminton</option>
                        <option value={FieldType.YOGA}>Yoga</option>
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
