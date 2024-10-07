import styles from './Loading.module.scss';

export function Loading() {
    return (
        <div className={styles.overlay}>
            <img src='/loading.png' alt='Loading...' className={styles.loadingLogo} />
        </div>
    );
}
