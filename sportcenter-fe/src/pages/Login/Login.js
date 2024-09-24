import clsx from 'clsx';
import Button from '../../components/Button/Button';
import styles from '../../assets/css/Login/login.module.scss';

function Login() {
    const handleClick = () => {
        alert("clicked")
    }
    const classes = clsx(styles.loginContainer)
    return (
        <div className={classes}>
            <Button active onClick={handleClick}>Click me</Button>
        </div>
    )
}

export default Login;
