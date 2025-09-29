import React from 'react';
import styles from './video.module.scss';

function Video({ src, title }) {
    return (
        <div className={styles.videoContainer}>
            <video title={title} controls width='100%' height='auto' className={styles.videoElement}>
                {src ? (
                    <source src={src} type='video/mp4' />
                ) : (
                    <img src={src} alt='Video Unavailable' className={styles.videoPlaceholder} />
                )}
                {!src && <p className={styles.videoFallBackText}>Video không khả dụng.</p>}
            </video>
        </div>
    );
}

export default Video;
