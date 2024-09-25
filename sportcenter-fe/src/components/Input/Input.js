import clsx from 'clsx';
import styles from '../../assets/css/Components/input.module.scss';

function Input({ type, placeHolder, className }) {
    const classes = clsx(styles.input, className);
    return (
        <input 
            className={ classes } 
            type={type} 
            placeholder={placeHolder}
            required
            />
    )
}

export default Input;
