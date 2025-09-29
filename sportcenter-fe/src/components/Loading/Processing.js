import styles from './processing.module.scss';

export function Processing() {
    return (
        <div className={styles.overlay}>
            <div className={styles.loadingText}>Processing...</div>
            <div className={styles.progressBar}>
                <div className={styles.progress}></div>
            </div>
        </div>
    );
}
