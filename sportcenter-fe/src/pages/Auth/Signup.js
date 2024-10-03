import clsx from 'clsx';
import { Link } from 'react-router-dom';

import Button from '../../components/Button/Button';
import styles from '../../assets/css/Auth/auth.module.scss';
import Input from '../../components/Input/Input';

function Signup() {
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('clicked');
    };

    return (
        <div className={clsx(styles.loginContainer)}>
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
                        <Input className='mb-3' type={'text'} placeholder={'e.g. Nguyen Van A'} id='fullname' />
                    </div>

                    <div className={styles.inputBox}>
                        <label htmlFor='email' className='font-cera-round-pro-bold ms-2'>
                            Email Address
                        </label>
                        <Input className='mb-3' type={'email'} placeholder={'e.g. user001@gmail.com'} id='email' />
                    </div>

                    <div className={styles.inputBox}>
                        <label htmlFor='password' className='font-cera-round-pro-bold ms-2'>
                            Password
                        </label>
                        <Input
                            className='mb-3'
                            type={'password'}
                            placeholder={'Enter strong password...'}
                            id='password'
                        />
                    </div>

                    <div className={styles.inputBox}>
                        <label htmlFor='confirmPassword' className='font-cera-round-pro-bold ms-2'>
                            Confirm Password
                        </label>
                        <Input
                            className='mb-3'
                            type={'password'}
                            placeholder={'Confirm your password...'}
                            id='confirmPassword'
                        />
                    </div>
                </div>

                <Button className='font-size-20px mt-3' type='submit'>
                    Sign up
                    <i className='fas fa-sign-in-alt ms-2'></i>
                </Button>

                <div className='font-cera-round-pro-regular mt-2'>
                    Already have an account?
                    <Link className='text-underline ms-2'>Log in here</Link>
                </div>
            </form>
        </div>
    );
}

export default Signup;
