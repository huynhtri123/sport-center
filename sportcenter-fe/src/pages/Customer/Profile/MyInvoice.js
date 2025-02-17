import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../../assets/css/Profile/myInvoice.module.scss';
import userApi from '../../../services/api/userApi';
import { Loading } from '../../../components/Loading/Loading';
import ConfirmModal from '../../../components/Modal/ConfirmModal';

function MyInvoice() {
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);
    const [expandedInvoice, setExpandedInvoice] = useState(null); // Track expanded invoice

    const fetchUserInvoices = async () => {
        try {
            setIsLoading(true);
            const response = await userApi.getMyInvoices(); // Correct API method to fetch invoices
            console.log('API Response:', response);

            const invoiceData = response.data;

            if (invoiceData && invoiceData.length > 0) {
                setInvoices(invoiceData);
            } else {
                setInvoices([]); // No invoices found
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch invoices.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInvoices();
    }, []);

    const handleDeleteInvoice = (invoiceId) => {
        setInvoiceToDelete(invoiceId);
        setIsConfirmModalOpen(true); // Show confirmation modal
    };

    const confirmDeleteInvoice = async () => {
        if (!invoiceToDelete) {
            toast.error('Invoice ID is required.');
            return;
        }
        try {
            // Call deleteInvoice API method from userApi
            await userApi.deleteInvoice(invoiceToDelete); 
            // Filter out the deleted invoice from the state
            setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.id !== invoiceToDelete));
            toast.success('Invoice deleted successfully');
        } catch (error) {
            console.error('Error deleting invoice:', error);
            toast.error('Failed to delete invoice.');
        } finally {
            setIsConfirmModalOpen(false); // Close confirmation modal
            setInvoiceToDelete(null); // Reset invoiceToDelete state
        }
    };

    const toggleInvoiceDetails = (invoiceId) => {
        if (expandedInvoice === invoiceId) {
            setExpandedInvoice(null); // If the same invoice is clicked, collapse it
        } else {
            setExpandedInvoice(invoiceId); // Expand the clicked invoice
        }
    };

    return (
        <div className={styles.myInvoiceContainer}>
            {isLoading && <Loading />}
            {invoices.length > 0 ? (
                invoices.map((invoice, index) => (
                    <InvoiceCard
                        key={index}
                        invoice={invoice}
                        onDelete={() => handleDeleteInvoice(invoice.id)} // Pass invoice id to delete
                        onToggleDetails={() => toggleInvoiceDetails(invoice.id)} // Toggle details
                        isExpanded={expandedInvoice === invoice.id} // Check if invoice is expanded
                    />
                ))
            ) : (
                <p>No invoices found.</p>
            )}

            {isConfirmModalOpen && (
                <ConfirmModal
                    title='Are you sure you want to delete this invoice?'
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onSubmit={confirmDeleteInvoice} // Call confirmDeleteInvoice to handle actual deletion
                />
            )}
        </div>
    );
}

function InvoiceCard({ invoice, onDelete, onToggleDetails, isExpanded }) {
    return (
        <div className={styles.invoiceCard}>
            <h4>Invoice ID: {invoice.id}</h4>
            <p><span>Amount:</span> ${invoice.amount}</p>

            {/* Button Container */}
            <div className={styles.buttonContainer}>
                {/* Expand Button with icon */}
                <button onClick={onToggleDetails} className={styles.expandButton}>
                    {isExpanded ? (
                        <span className="material-icons">expand_less</span> // Expand less icon
                    ) : (
                        <span className="material-icons">expand_more</span> // Expand more icon
                    )}
                </button>

                {/* Remove Button with icon 1*/}
                <button onClick={onDelete} className={styles.removeButton}>
                    <span className="material-icons">Delete</span> {/* Delete icon */}

                </button>
            </div>

            {/* Invoice Details (expanded view) */}
            {isExpanded && (
                <div className={styles.invoiceDetails}>
                    <p><span>Type:</span> {invoice.transactionType}</p>
                    <p><span>Status:</span> {invoice.paymentStatus}</p>
                    <p><span>Method:</span> {invoice.paymentMethod}</p>
                    <p><span>Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
                </div>
            )}
        </div>
    );
}

export default MyInvoice;
