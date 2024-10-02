import clsx from "clsx";
import styles from "../../assets/css/Components/input.module.scss";

function Input({ className, ...props }) {
    const classes = clsx(styles.input, className);
    return (
        <input
            className={classes}
            type="text"
            placeholder="Enter value..."
            {...props}
        />
    );
}

export default Input;
