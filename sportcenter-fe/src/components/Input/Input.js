import clsx from 'clsx';
import styles from '../../assets/css/Components/input.module.scss';

function Input({ className, width, height, ...props }) {
    const classes = clsx(styles.input, className);

    // Áp dụng style inline với width và height
    const customStyles = {
        width: width || '380px',
        height: height || '52px',
    };

    return <input className={classes} style={customStyles} {...props} />;
}

export default Input;
