import styles from './Modal.module.scss';
import clsx from 'clsx';

function ConfirmModal({ title, isOpen, onClose, onSubmit }) {
    if (!isOpen) return null;

    return (
        <div className={clsx(styles.modalOverlay)}>
            <div className={clsx(styles.modalContent)}>
                <h4>{title}</h4>
                <div className={clsx('d-flex', 'justify-content-center', 'mt-3')}>
                    <button className={clsx('btn', 'btn-primary', 'me-2')} onClick={onSubmit}>
                        Xác nhận
                    </button>
                    <button className={clsx('btn', 'btn-secondary')} onClick={onClose}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
