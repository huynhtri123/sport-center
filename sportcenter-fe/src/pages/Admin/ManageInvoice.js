import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import invoiceApi from '../../services/api/invoiceApi';
import styles from '../../assets/css/Admin/manageInvoices.module.scss';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import { PaymentStatus } from '../../utils/enums/PaymentStatus';
import { PaymentMethod } from '../../utils/enums/PaymentMethod';
import { TransactionType } from '../../utils/enums/TransactionType';

function ManageInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
    const [transactionTypeFilter, setTransactionTypeFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc'); // Trạng thái sắp xếp (asc/desc)

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await invoiceApi.getAllActive();
            setInvoices(response.data);
            setFilteredInvoices(response.data);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
            toast.error('Failed to fetch invoices.');
        }
    };

    // Lọc và sắp xếp invoices
    useEffect(() => {
        let filteredData = invoices;

        if (paymentStatusFilter) {
            filteredData = filteredData.filter((invoice) => invoice.paymentStatus === paymentStatusFilter);
        }

        if (paymentMethodFilter) {
            filteredData = filteredData.filter((invoice) => invoice.paymentMethod === paymentMethodFilter);
        }

        if (transactionTypeFilter) {
            filteredData = filteredData.filter((invoice) => invoice.transactionType === transactionTypeFilter);
        }

        // Sắp xếp theo Amount
        if (sortOrder === 'asc') {
            filteredData = filteredData.sort((a, b) => a.amount - b.amount); // Tăng dần
        } else if (sortOrder === 'desc') {
            filteredData = filteredData.sort((a, b) => b.amount - a.amount); // Giảm dần
        }

        setFilteredInvoices(filteredData);
    }, [paymentStatusFilter, paymentMethodFilter, transactionTypeFilter, invoices, sortOrder]);

    const handleDeleteInvoice = async () => {
        try {
            const response = await invoiceApi.softDelete(invoiceToDelete.id);
            fetchInvoices();
            toast.success(response.message);
        } catch (error) {
            console.error('Failed to delete invoice:', error);
        } finally {
            setIsModalOpen(false);
        }
    };

    const openModal = (invoice) => {
        setInvoiceToDelete(invoice);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setInvoiceToDelete(null);
    };

    // Hàm xử lý sắp xếp
    const handleSort = () => {
        setSortOrder((prevSortOrder) => (prevSortOrder === 'asc' ? 'desc' : 'asc')); // Đảo ngược trạng thái sắp xếp
    };

    return (
        <div className={styles.manageInvoices}>
            <div className={styles.filters}>
                <label>Payment Status:</label>
                <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
                    <option value=''>All</option>
                    {Object.values(PaymentStatus).map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>

                <label>Payment Method:</label>
                <select value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)}>
                    <option value=''>All</option>
                    {Object.values(PaymentMethod).map((method) => (
                        <option key={method} value={method}>
                            {method}
                        </option>
                    ))}
                </select>

                <label>Transaction Type:</label>
                <select value={transactionTypeFilter} onChange={(e) => setTransactionTypeFilter(e.target.value)}>
                    <option value=''>All</option>
                    {Object.values(TransactionType).map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            <table className={styles.invoicesTable}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>User Email</th>
                        <th>User Full Name</th>
                        <th onClick={handleSort} style={{ cursor: 'pointer' }}>
                            Amount{' '}
                            {sortOrder === 'asc' ? (
                                <i className='ms-2 fa-solid fa-arrow-up-short-wide'></i>
                            ) : (
                                <i className='ms-2 fa-solid fa-arrow-down-short-wide'></i>
                            )}
                        </th>
                        <th>Payment Status</th>
                        <th>Payment Method</th>
                        <th>Transaction Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredInvoices.map((invoice, index) => (
                        <tr key={invoice.id}>
                            <td>{index + 1}</td>
                            <td>{invoice.userEmail}</td>
                            <td>{invoice.userFullName}</td>
                            <td>{invoice.amount}</td>
                            <td>{invoice.paymentStatus}</td>
                            <td>{invoice.paymentMethod}</td>
                            <td>{invoice.transactionType}</td>
                            <td>
                                <button className={`btn ${styles.deleteButton}`} onClick={() => openModal(invoice)}>
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ConfirmModal
                title='Are you sure you want to delete this invoice?'
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleDeleteInvoice}
            />
        </div>
    );
}

export default ManageInvoices;
