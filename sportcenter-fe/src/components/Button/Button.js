import clsx from 'clsx';
import styles from '../../assets/css/Components/button.module.scss';

function Button({ className, ...props }) {
    const classes = clsx(
        styles.btn,
        {
            [styles.active]: props.active,
            [styles.typeSubmit]: props.type === 'submit',
        },
        className
    );

    return (
        <>
            <button className={classes} onClick={props.onClick}>
                {props.children}
            </button>
        </>
    );
}

export default Button;
