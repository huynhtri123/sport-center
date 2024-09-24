import clsx from "clsx";
import styles from '../../assets/css/Button/button.module.scss';

function Button({active, onClick, children}) {
    const classes = clsx(styles.btn, 
        {
            [styles.active]: active
        }
    );
    return (
        <>
            <button className={classes} onClick={onClick}>{children}</button>
        </>
    )
}

export default Button;
