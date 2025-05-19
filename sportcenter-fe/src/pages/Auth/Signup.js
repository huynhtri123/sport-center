import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/css/Auth/signup.module.scss';
import Signup2Modal from '../../components/Modal/Signup2Modal';
import { SignupSchema } from '../../utils/rules/SignupSchema';
import authApi from '../../services/api/auth/authApi';
import { Loading } from '../../components/Loading/Loading';

function Signup() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        passwordConfirm: '',
    });

    // lưu response khi đăng kí bước 1, chút dùng cho bước 2
    const [verifyResponse, setVerifyResponse] = useState({
        id: '',
        expiredAt: null,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prevState) => !prevState);
    };

    // lưu lỗi input
    const [errors, setErrors] = useState({});

    // quản lý trạng thái modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    // hiệu ứng loading khi chờ xử lý đăng ký bước 1
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleChangeInput = (e) => {
        const { name, value } = e.target;

        // Clear specific password errors when modifying the fields
        if (name === 'password' || name === 'passwordConfirm') {
            setErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                // Remove errors related to password and confirm password
                delete newErrors.password;
                delete newErrors.passwordConfirm;
                return newErrors;
            });
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const signupStep1 = () => {
        return new Promise((resolve, reject) => {
            authApi
                .signup(formData)
                .then((response) => {
                    if (!response) {
                        throw new Error('Gọi API signup không thành công!');
                    }

                    setVerifyResponse(response.data);
                    toast.success(response.message);
                    resolve(response);
                })
                .catch((error) => {
                    console.error('Error during signup:', error);
                    reject(error);
                });
        });
    };

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // submit đăng ký bước 1
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Clear previous errors before validation
        setErrors({});

        // Kiểm tra email hợp lệ
        if (!isValidEmail(formData.email)) {
            setErrors({
                ...errors,
                email: 'Invalid email!',
            });
            return;
        }

        // Kiểm tra nếu mật khẩu chứa khoảng trắng
        if (formData.password.includes(' ')) {
            setErrors({
                password: 'Password must not contain spaces!',
            });
            return;
        }
        // Kiểm tra nếu mật khẩu chứa khoảng trắng
        if (formData.passwordConfirm.includes(' ')) {
            setErrors({
                passwordConfirm: 'Password must not contain spaces!',
            });
            return;
        }

        // reset lỗi input về rỗng
        setErrors({});
        setIsLoading(true); // bắt đầu hiệu ứng loading

        // Validate dữ liệu bằng Yup
        try {
            await SignupSchema.validate(formData, { abortEarly: false });
        } catch (validationErrors) {
            // nếu validate có lỗi thì nó nằm trong validationErrors.inner
            if (validationErrors && validationErrors.inner) {
                const formErrors = {};
                validationErrors.inner.forEach((error) => {
                    formErrors[error.path] = error.message;
                });
                setErrors(formErrors);
            } else {
                console.error('Validation error structure is not as expected', validationErrors);
            }
            setIsLoading(false);
            return;
        }

        // xử lý đăng ký bước 1 (tạo tk + gửi mail)
        try {
            await signupStep1();
            // bước 1 thành công -> mở modal để tiếp tục bước 2
            toggleModal();
        } catch (apiError) {
            console.error('API error:', apiError);
        } finally {
            setIsLoading(false); // tắt hiệu ứng loading
        }
    };

    // nếu đk bước 2 lỗi thì thông báo cho Modal
    const [isError, setIsError] = useState(false);
    // đăng ký bước 2
    const signupStep2 = async (code) => {
        try {
            const response = await authApi.signupStep2(verifyResponse.id, { code });
            console.log(response.data);
            toast.success(response.message);
            setIsError(false);

            return response;
        } catch (error) {
            console.error('Lỗi trong quá trình xác minh:', error);
            setIsError(true);
            if (error.response) {
                return null; // Trả về null nếu có lỗi, toast thi được xử lý bên axiosClient rồi
            }
        }
    };

    // submit đăng ký bước 2
    const handleVerifyCode = async (code) => {
        const response = await signupStep2(code);
        // chỉ đóng modal khi xác minh thành công
        if (response) {
            toggleModal();
            navigate('/sign-in');
        }
    };

    return (
        <div className={styles.authContainer}>
            {isLoading && <Loading />}

            <form onSubmit={handleSubmit} className={styles.signupBox}>
                <div className={styles.titleGroup}>
                    <span className={styles.titleWelcome}>
                        Get Started <i className='far fa-laugh'></i>
                    </span>
                    <span className={styles.titleMain}>Create Your Account</span>
                </div>

                <div className={styles.inputGroup}>
                    <div className={styles.inputBox}>
                        <label htmlFor='fullname' className={styles.label}>
                            Full Name
                        </label>
                        <input
                            id='fullname'
                            type='text'
                            placeholder='e.g. Nguyen Van A'
                            name='fullName'
                            value={formData.fullName}
                            onChange={handleChangeInput}
                            required
                            className={`${styles.input} ${errors.fullName ? styles.failed : ''}`}
                        />
                        {errors.fullName && <div className={styles.errorText}>{errors.fullName}</div>}
                    </div>

                    <div className={styles.inputBox}>
                        <label htmlFor='email' className={styles.label}>
                            Email Address
                        </label>
                        <input
                            id='email'
                            type='email'
                            placeholder='e.g. user001@gmail.com'
                            name='email'
                            value={formData.email}
                            onChange={handleChangeInput}
                            required
                            className={`${styles.input} ${errors.email ? styles.failed : ''}`}
                        />
                        {errors.email && <div className={styles.errorText}>{errors.email}</div>}
                    </div>

                    <div className={styles.inputBox}>
                        <label htmlFor='password' className={styles.label}>
                            Password{' '}
                            <span onClick={togglePasswordVisibility} className={styles.iconShowHide}>
                                {showPassword ? (
                                    <i className='fa-regular fa-eye' title='Hide password?'></i>
                                ) : (
                                    <i className='fa-regular fa-eye-slash' title='Show password?'></i>
                                )}
                            </span>
                        </label>
                        <input
                            id='password'
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Enter strong password...'
                            name='password'
                            value={formData.password}
                            onChange={handleChangeInput}
                            required
                            className={`${styles.input} ${errors.password ? styles.failed : ''}`}
                        />
                        {errors.password && <div className={styles.errorText}>{errors.password}</div>}
                    </div>

                    <div className={styles.inputBox}>
                        <label htmlFor='confirmPassword' className={styles.label}>
                            Confirm Password{' '}
                            <span onClick={toggleConfirmPasswordVisibility} className={styles.iconShowHide}>
                                {showConfirmPassword ? (
                                    <i className='fa-regular fa-eye' title='Hide password?'></i>
                                ) : (
                                    <i className='fa-regular fa-eye-slash' title='Show password?'></i>
                                )}
                            </span>
                        </label>
                        <input
                            id='confirmPassword'
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder='Confirm your password...'
                            name='passwordConfirm'
                            value={formData.passwordConfirm}
                            onChange={handleChangeInput}
                            required
                            className={`${styles.input} ${errors.passwordConfirm ? styles.failed : ''}`}
                        />
                        {errors.passwordConfirm && <div className={styles.errorText}>{errors.passwordConfirm}</div>}
                    </div>

                    <div className={styles.verifyLink}>
                        <Link to='/forgot-password'>Verify your account?</Link>
                    </div>
                </div>

                <button type='submit' className={styles.submitBtn}>
                    {isLoading ? (
                        'Signing up...'
                    ) : (
                        <>
                            Sign up <i className='fas fa-sign-in-alt'></i>
                        </>
                    )}
                </button>

                <div className={styles.registerText}>
                    Already have an account?
                    <Link to='/sign-in' className={styles.link}>
                        Log in here
                    </Link>
                </div>
            </form>

            {/* Modal cho đăng ký bước 2 (nhập otp) */}
            <Signup2Modal
                isOpen={isModalOpen}
                onClose={toggleModal}
                onSubmit={handleVerifyCode}
                signupEmail={formData.email}
                isError={isError}
            />
        </div>
    );
}

export default Signup;
