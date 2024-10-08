import clsx from 'clsx';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/Button/Button';
import styles from '../../assets/css/Auth/auth.module.scss';
import Input from '../../components/Input/Input';
import Signup2Modal from '../../components/Modal/Signup2Modal';
import { SignupSchema } from '../../utils/Rules/SignupSchema';
import authApi from '../../services/api/authApi';
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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
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

    // submit đăng ký bước 1
    const handleSubmit = async (e) => {
        e.preventDefault();
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
        <div className={clsx(styles.authContainer)}>
            {isLoading && <Loading></Loading>}

            <form onSubmit={handleSubmit} className={clsx(styles.signupBox, 'flex-column')}>
                <div className='font-size-24px mb-3 d-flex flex-column'>
                    <span className='font-cera-round-pro-yellow'>
                        Get Started
                        <i className='far fa-laugh ms-2'></i>
                    </span>
                    <span className='font-cera-round-pro-black font-size-32px'>Create Your Account</span>
                </div>

                <div className={`input-box d-flex flex-column mt-4 ${styles.inputGroup}`}>
                    <div className={styles.inputBox}>
                        <label htmlFor='fullname' className='font-cera-round-pro-bold ms-2'>
                            Full Name
                        </label>
                        <Input
                            className='mb-3'
                            type={'text'}
                            placeholder={'e.g. Nguyen Van A'}
                            name='fullName'
                            value={formData.fullName}
                            onChange={(e) => handleChangeInput(e)}
                            required
                        />
                        {errors.fullName && <div className={'errors-input'}>{errors.fullName}</div>}
                    </div>

                    <div className={styles.inputBox}>
                        <label htmlFor='email' className='font-cera-round-pro-bold ms-2'>
                            Email Address
                        </label>
                        <Input
                            className='mb-3'
                            type={'email'}
                            placeholder={'e.g. user001@gmail.com'}
                            name='email'
                            value={formData.email}
                            onChange={(e) => handleChangeInput(e)}
                            required
                        />
                        {errors.email && <div className={styles.errorsInput}>{errors.email}</div>}
                    </div>

                    <div className={styles.inputBox}>
                        <label htmlFor='password' className='font-cera-round-pro-bold ms-2'>
                            Password
                        </label>
                        <Input
                            className={clsx('mb-3')}
                            type={'password'}
                            placeholder={'Enter strong password...'}
                            name='password'
                            value={formData.password}
                            onChange={(e) => handleChangeInput(e)}
                            required
                        />
                        {errors.password && <div className={styles.errorsInput}>{errors.password}</div>}
                    </div>

                    <div className={styles.inputBox}>
                        <label htmlFor='confirmPassword' className='font-cera-round-pro-bold ms-2'>
                            Confirm Password
                        </label>
                        <Input
                            className={clsx('mb-3')}
                            type={'password'}
                            placeholder={'Confirm your password...'}
                            name='passwordConfirm'
                            value={formData.passwordConfirm}
                            onChange={(e) => handleChangeInput(e)}
                            required
                        />
                        {errors.passwordConfirm && <div className={styles.errorsInput}>{errors.passwordConfirm}</div>}
                    </div>
                </div>

                <Button className={clsx('font-size-20px mt-3')} type='submit'>
                    {isLoading ? (
                        'Signing up...'
                    ) : (
                        <span>
                            Sign up
                            <i className='fas fa-sign-in-alt ms-2'></i>
                        </span>
                    )}
                </Button>

                <div className='font-cera-round-pro-regular mt-2'>
                    Already have an account?
                    <Link to={'/sign-in'} className='text-underline ms-2'>
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
