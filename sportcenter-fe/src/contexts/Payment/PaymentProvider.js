import { useState } from 'react';
import PaymentContext from './PaymentContext';

function PaymentProvider({ children }) {
    const [paymentData, setPaymenData] = useState({
        amount: null,
        onSubmit: null,
        type: null,
        createInvoice: null,
        confirmBooking: null,
        makePaymentByBalance: null,
        amountByBalance: null,
    });
    return <PaymentContext.Provider value={[paymentData, setPaymenData]}>{children}</PaymentContext.Provider>;
}

export default PaymentProvider;
