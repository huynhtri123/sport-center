import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { handleLocalStorage } from '../../utils/handleLocalStorage';
import { useCheckSignedIn } from '../../customs/hooks';
import styles from '../../assets/css/auth/auth.module.scss';
import Button from '../../components/button/button';
import ConfirmModal from '../../components/modal/ConfirmModal';
import authApi from '../../services/api/auth/authApi';

function Signout() {
    // eslint-disable-next-line no-unused-vars
    const [isSignedIn, setIsSignedIn] = useCheckSignedIn();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModalOpen = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleSignout = async () => {
        try {
            const signoutResponse = await authApi.signout();
            toast.success(signoutResponse.message);
            handleLocalStorage.clearToken();
            setIsSignedIn(false);
            navigate('/');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <Button onClick={toggleModalOpen} className={styles.logoutButton}>
                Sign out
            </Button>
            {isModalOpen && (
                <ConfirmModal
                    title={'Are you sure you want to log out?'}
                    isOpen={isModalOpen}
                    onClose={toggleModalOpen}
                    onSubmit={handleSignout}
                ></ConfirmModal>
            )}
        </>
    );
}

export default Signout;
