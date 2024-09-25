import clsx from 'clsx';
import { Link } from 'react-router-dom';

import Button from '../../components/Button/Button';
import styles from '../../assets/css/Auth/auth.module.scss';
import Input from '../../components/Input/Input';

function Signin() {
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('clicked')
    }

    return (
        <div className={clsx(styles.loginContainer)}>
            <form onSubmit={handleSubmit} className={clsx(styles.signinBox, 'flex-column')}>
                <div className='font-size-24px mb-5 d-flex flex-column'>
                    <span className='font-cera-round-pro-yellow'>
                        Welcome Back
                        <i class="fa-solid fa-face-laugh ms-2"></i>
                    </span>
                    <span className='font-cera-round-pro-black font-size-32px'>Sign In to Your Account</span>
                </div>
                
                <div className={`input-box d-flex flex-column mt-4 ${styles.inputGroup}`}>     
                    <div className={styles.inputBox}>
                        <label htmlFor="email" className='font-cera-round-pro-bold ms-2'>Email Address</label>
                        <Input className='mb-3' type={'email'} placeHolder={'e.g. user001@gmail.com'} id="email" />
                    </div>
                    
                    <div className={styles.inputBox}>
                        <label htmlFor="password" className='font-cera-round-pro-bold ms-2'>Password</label>
                        <Input className='mb-3' type={'password'} placeHolder={'Enter your password...'} id="password" />
                    </div>

                    <div className='mb-2'>
                        <Link>Forgot your password?</Link>
                    </div>
                </div>
                
                <Button className='font-size-20px mt-3' type='submit'>
                    Sign in
                    <i class="fas fa-sign-in-alt ms-2"></i>
                </Button>

                <div className='font-cera-round-pro-regular mt-2'>
                    New here? 
                    <Link className='text-underline ms-2'>Create your account now</Link>
                </div>
            </form>
        </div>
    )
}

export default Signin;
