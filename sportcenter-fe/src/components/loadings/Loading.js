import styles from './loading.module.scss';

export function Loading() {
    return (
        <div className={styles.overlay}>
            <img
                src='https://res.cloudinary.com/dftznqjsj/image/upload/v1732352213/loading_esbklb.png'
                alt='Loading...'
                className={styles.loadingLogo}
            />
        </div>
    );
}
