import clsx from 'clsx';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';

import Button from '../../components/Button/Button';
import styles from '../../assets/css/Auth/auth.module.scss';
import Input from '../../components/Input/Input';
import authApi from '../../services/api/authApi';
import { handleLocalStorage } from '../../utils/handleLocalStorage';

function Signin() {
    const [signinRequest, setSigninRequest] = useState({
        email: '',
        password: '',
    });

    const handleChangeInput = (e) => {
        setSigninRequest((prevState) => {
            const newState = {
                ...prevState,
                [e.target.name]: e.target.value,
            };
            return newState;
        });
    };

    const navigate = useNavigate();

    // khi đăng nhập sai thông tin thì dùng cái này để css
    const [failed, setFailed] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const siginResponse = await authApi.signin(signinRequest);
            // Xóa thông tin cũ trước khi lưu thông tin mới (việc này sẽ cho làm trong đăng xuất)
            handleLocalStorage.clearToken();

            // Lưu thông tin mới vào localStorage
            const { email, tokenType, token, refreshToken } = siginResponse.data;
            handleLocalStorage.setToken(email, tokenType, token, refreshToken);

            console.log('Logged in successfully:', siginResponse.data);
            toast.success('Login successfully!');
            setFailed(false);
            navigate('/');
        } catch (error) {
            // Thông báo đã được cài trong axiosClient rồi nên ở đây khỏi
            console.error('Login failed:', error);
            setFailed(true);
        }
    };

    return (
        <div className={clsx(styles.authContainer)}>
            <form onSubmit={handleSubmit} className={clsx(styles.signinBox, 'flex-column')}>
                <div className='font-size-24px mb-5 d-flex flex-column'>
                    <span className='font-cera-round-pro-yellow'>
                        Welcome Back
                        <i className='fa-solid fa-face-laugh ms-2'></i>
                    </span>
                    <span className='font-cera-round-pro-black font-size-32px'>Sign In to Your Account</span>
                </div>

                <div className={`input-box d-flex flex-column mt-4 ${styles.inputGroup}`}>
                    <div className={styles.inputBox}>
                        <label htmlFor='email' className='font-cera-round-pro-bold ms-2'>
                            Email Address
                        </label>
                        <Input
                            className={clsx('mb-3', { [styles.failed]: failed })}
                            type={'email'}
                            placeholder={'e.g. user001@gmail.com'}
                            name='email'
                            value={signinRequest.email}
                            onChange={(e) => handleChangeInput(e)}
                            required
                        />
                    </div>

                    <div className={styles.inputBox}>
                        <label htmlFor='password' className='font-cera-round-pro-bold ms-2'>
                            Password
                        </label>
                        <Input
                            className={clsx('mb-3', { [styles.failed]: failed })}
                            type={'password'}
                            placeholder={'Enter your password...'}
                            name='password'
                            value={signinRequest.password}
                            onChange={(e) => handleChangeInput(e)}
                            required
                        />
                    </div>

                    <div className='mb-2'>
                        <Link>Forgot your password?</Link>
                    </div>
                </div>

                <Button className='font-size-20px mt-3' type='submit'>
                    Sign in
                    <i className='fas fa-sign-in-alt ms-2'></i>
                </Button>

                <div className='font-cera-round-pro-regular mt-2'>
                    New here?
                    <Link className='text-underline ms-2'>Create your account now</Link>
                </div>
            </form>
        </div>
    );
}

export default Signin;
