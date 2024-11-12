import { useEffect, useState } from 'react';
import userApi from '../../../services/api/userApi';
import styles from '../../../assets/css/Profile/myPaymentInfo.module.scss';
import formatCurrency from '../../../utils/formatCurrency';

function MyPaymentInfo() {
    const [accountBalance, setAccountBalance] = useState(0);
    const fetchAccountBalance = async () => {
        try {
            const response = await userApi.getAccountBalance();
            setAccountBalance(response.data || 0);
            console.log(response);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        fetchAccountBalance();
    }, []);

    return (
        <div className='myPaymentInfoContainer'>
            <p className={styles.price}>Số dư hiện có: {formatCurrency(accountBalance)}</p>
        </div>
    );
}

export default MyPaymentInfo;
