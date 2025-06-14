import clsx from 'clsx';
import styles from '../assets/css/Layouts/footer.module.scss';

function Footer() {
    return (
        <footer className={clsx(styles.footerStyle)}>
            <div className={clsx(styles.footerContentStyle)}>
                <span className={clsx(styles.footerTitle)}>SPORT CENTER</span>
                <div className={clsx(styles.copyright)}>
                    <span>&copy; 2025 All rights reserved.</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
