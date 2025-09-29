/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import invoiceApi from '../../../services/api/invoice/invoiceApi';
import styles from '../../../assets/css/admin/manage/manageInvoices.module.scss';
import ConfirmModal from '../../../components/modal/ConfirmModal';
import { PaymentMethod } from '../../../utils/enums/PaymentMethod';
import { TransactionType } from '../../../utils/enums/TransactionType';

function ManageInvoices() {
    const [invoices, setInvoices] = useState([]);

    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
    const [transactionTypeFilter, setTransactionTypeFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);

    const [sortOrderAmount, setSortOrderAmount] = useState('asc');
    const [sortOrderCreatedAt, setSortOrderCreatedAt] = useState('asc');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    useEffect(() => {
        let filteredData = invoices;

        if (paymentMethodFilter) {
            filteredData = filteredData.filter((invoice) => invoice.paymentMethod === paymentMethodFilter);
        }
        if (transactionTypeFilter) {
            filteredData = filteredData.filter((invoice) => invoice.transactionType === transactionTypeFilter);
        }
        if (searchQuery) {
            filteredData = filteredData.filter((invoice) =>
                invoice.userFullName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredInvoices(filteredData);
        setCurrentPage(1);
    }, [paymentMethodFilter, transactionTypeFilter, searchQuery, invoices]);

    const handleSortByAmount = () => {
        const sortedData = [...filteredInvoices].sort((a, b) =>
            sortOrderAmount === 'asc' ? a.amount - b.amount : b.amount - a.amount
        );
        setFilteredInvoices(sortedData);
        setSortOrderAmount(sortOrderAmount === 'asc' ? 'desc' : 'asc');
    };

    const handleSortByCreatedAt = () => {
        const sortedData = [...filteredInvoices].sort((a, b) =>
            sortOrderCreatedAt === 'asc'
                ? new Date(a.createdAt) - new Date(b.createdAt)
                : new Date(b.createdAt) - new Date(a.createdAt)
        );
        setFilteredInvoices(sortedData);
        setSortOrderCreatedAt(sortOrderCreatedAt === 'asc' ? 'desc' : 'asc');
    };

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

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

    return (
        <div className={styles.manageInvoices}>
            <div className={styles.filters}>
                <input
                    type='text'
                    placeholder='Enter the characters in the user name...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: '14px' }}
                />
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
                        <th onClick={handleSortByAmount} style={{ cursor: 'pointer' }}>
                            Amount{' '}
                            {sortOrderAmount === 'asc' ? (
                                <i className='fa-solid fa-arrow-up-short-wide ms-2'></i>
                            ) : (
                                <i className='fa-solid fa-arrow-down-short-wide ms-2'></i>
                            )}
                        </th>
                        <th onClick={handleSortByCreatedAt} style={{ cursor: 'pointer' }}>
                            Created Date{' '}
                            {sortOrderCreatedAt === 'asc' ? (
                                <i className='fa-solid fa-arrow-up-short-wide ms-2'></i>
                            ) : (
                                <i className='fa-solid fa-arrow-down-short-wide ms-2'></i>
                            )}
                        </th>
                        <th>Payment Method</th>
                        <th>Transaction Type</th>
                        {/* <th>Actions</th> */}
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((invoice, index) => (
                        <tr key={invoice.id}>
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td>{invoice.userEmail}</td>
                            <td>{invoice.userFullName}</td>
                            <td>{invoice.amount}</td>
                            <td>{new Date(invoice.createdAt).toLocaleString('vi-VN', { hour12: false })}</td>
                            <td>{invoice.paymentMethod}</td>
                            <td>{invoice.transactionType}</td>
                            {/* <td>
                                <button className={`btn ${styles.deleteButton}`} onClick={() => openModal(invoice)}>
                                    Remove
                                </button>
                            </td> */}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={styles.pagination}>
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>

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
