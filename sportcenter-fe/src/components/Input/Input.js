import clsx from 'clsx';
import styles from '../../assets/css/Components/input.module.scss';

function Input({ className, ...props }) {
    const classes = clsx(styles.input, className);
    return <input className={classes} type='text' {...props} />;
}

export default Input;
