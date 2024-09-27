import clsx from "clsx";
import styles from "../assets/css/Layouts/footer.module.scss";

function Footer() {
    return (
        <footer className={clsx(styles.footerStyle)}>
            <div className={clsx(styles.footerContentStyle)}>
                <span>FOOTER</span>
            </div>
        </footer>
    );
}

export default Footer;
