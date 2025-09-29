import clsx from 'clsx';
import styles from '../../assets/css/components/button.module.scss';

function Button({ active, type, onClick, className, children }) {
    const classes = clsx(
        styles.btn,
        {
            [styles.active]: active,
            [styles.typeSubmit]: type === 'submit',
        },
        className
    );
    return (
        <>
            <button className={classes} onClick={onClick}>
                {children}
            </button>
        </>
    );
}

export default Button;
