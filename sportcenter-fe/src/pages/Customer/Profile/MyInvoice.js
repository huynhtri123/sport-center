import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from '../../../assets/css/Profile/myInvoice.module.scss';
import userApi from '../../../services/api/userApi';
import { Loading } from '../../../components/Loading/Loading';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import clsx from 'clsx';
import { CheckCircle, FileText } from 'lucide-react'; // Import icons

function MyInvoice() {
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null); // Invoice được chọn để hiển thị modal

    const fetchUserInvoices = async () => {
        try {
            setIsLoading(true);
            const response = await userApi.getMyInvoices();
            setInvoices(response.data.length > 0 ? response.data : []);
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
        setIsConfirmModalOpen(true);
    };

    const confirmDeleteInvoice = async () => {
        if (!invoiceToDelete) {
            toast.error('Invoice ID is required.');
            return;
        }
        try {
            await userApi.deleteInvoice(invoiceToDelete);
            setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.id !== invoiceToDelete));
            toast.success('Invoice deleted successfully');
        } catch (error) {
            console.error('Error deleting invoice:', error);
            toast.error('Failed to delete invoice.');
        } finally {
            setIsConfirmModalOpen(false);
            setInvoiceToDelete(null);
        }
    };

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
    };

    return (
        <div className={styles.myInvoiceContainer}>
            {isLoading && <Loading />}
            {invoices.length > 0 ? (
                <table className={styles.invoiceTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td>{invoice.id}</td>
                                <td>{invoice.paymentMethod}</td>
                                <td>{invoice.paymentStatus}</td>
                                <td>
                                    <button
                                        className={clsx(styles.viewButton, 'btn', 'btn-primary')}
                                        onClick={() => handleViewInvoice(invoice)}
                                    >
                                        View Invoice
                                    </button>
                                    <button
                                        className={clsx(styles.deleteButton, 'btn', 'btn-danger', 'color: white')}
                                        onClick={() => handleDeleteInvoice(invoice.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No invoices found.</p>
            )}

            {/* Modal Xác Nhận Xóa */}
            {isConfirmModalOpen && (
                <ConfirmModal
                    title="Are you sure you want to delete this invoice?"
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onSubmit={confirmDeleteInvoice}
                />
            )}

            {/* Modal Hiển Thị Chi Tiết Invoice */}
            {selectedInvoice && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center shadow-lg">
                        {/* Biểu tượng hóa đơn */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-gray-100 p-4 rounded-full relative">
                                <FileText size={40} className="text-gray-600" />
                                <CheckCircle size={20} className="text-green-500 absolute right-0 bottom-0" />
                            </div>
                        </div>

                        {/* Thông tin chính */}
                        <h3 className="text-gray-500 text-sm">Invoice paid</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                            {selectedInvoice.amount.toFixed(2)}
                        </p>


                        {/* Thông tin hóa đơn */}
                        <div className="mt-4 text-left text-gray-700 text-sm">
                            <p className="flex justify-between">
                                <span className="font-medium">Invoice number:</span>
                                <span>{selectedInvoice.id}</span>
                            </p>
                            <p className="flex justify-between mt-2">
                                <span className="font-medium">Payment date:</span>
                                <span>{new Date(selectedInvoice.createdAt).toLocaleDateString('en-GB')}</span>
                            </p>
                            <p className="flex justify-between mt-2">
                                <span className="font-medium">Payment method:</span>
                                <span>
                                    {selectedInvoice.paymentMethod}{selectedInvoice.cardLast4}
                                </span>
                            </p>
                        </div>

                        {/* Nút đóng */}
                        <button
                            style={{
                                backgroundColor: '#f44336', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '16px',
                            }}
                            onClick={() => setSelectedInvoice(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyInvoice;