import React, { useState } from 'react';
import { Modal, Button, Checkbox } from 'antd';

const PDFModal = ({ visible, onConfirm, onCancel }) => {
    const [isChecked, setIsChecked] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const handleFinalConfirm = () => {
        setIsConfirmModalVisible(false);
        onConfirm();
    };

    return (
        <>
            <Modal
                title='Cancel Booking Policies'
                open={visible}
                onCancel={onCancel}
                width={800}
                centered
                styles={{ mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' } }}
                footer={[
                    <Checkbox
                        key='checkbox'
                        onChange={(e) => setIsChecked(e.target.checked)}
                        style={{ marginRight: 'auto' }}
                    >
                        I agree to and accept the terms and conditions.
                    </Checkbox>,
                    <Button key='cancel' onClick={onCancel}>
                        Cancel
                    </Button>,
                    <Button
                        key='confirm'
                        type='primary'
                        onClick={() => setIsConfirmModalVisible(true)}
                        disabled={!isChecked}
                    >
                        Continue
                    </Button>,
                ]}
            >
                <iframe
                    title='Cancel Booking Policies'
                    src={`${process.env.PUBLIC_URL}/pdf/term.pdf`}
                    width='100%'
                    height='500px'
                    style={{ border: 'none' }}
                />
            </Modal>

            {/* Modal xác nhận cuối cùng */}
            <Modal
                title='Are you sure you want to cancel this booking?'
                open={isConfirmModalVisible}
                onCancel={() => setIsConfirmModalVisible(false)}
                width={500}
                centered
                styles={{ mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' } }}
                footer={[
                    <Button key='no' onClick={() => setIsConfirmModalVisible(false)}>
                        No
                    </Button>,
                    <Button key='yes' type='primary' onClick={handleFinalConfirm}>
                        Yes, Cancel Booking
                    </Button>,
                ]}
            >
                <p>This action cannot be undone. Are you sure you want to proceed?</p>
            </Modal>
        </>
    );
};

export default PDFModal;
