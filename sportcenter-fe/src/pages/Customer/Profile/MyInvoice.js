import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Table, Button, Modal, Badge } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import styles from '../../../assets/css/Profile/myInvoice.module.scss';
import userApi from '../../../services/api/user/userApi';
import { Loading } from '../../../components/Loading/Loading';
import formatCurrency from '../../../utils/formatCurrency';
import InvoiceChart from './InvoiceChart';

const { confirm } = Modal;

function MyInvoice() {
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchUserInvoices();
    }, []);

    const fetchUserInvoices = async () => {
        try {
            setIsLoading(true);
            const response = await userApi.getMyInvoices();
            console.log(response);
            setInvoices(response.data.length > 0 ? response.data : []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch invoices.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteInvoice = (invoiceId) => {
        confirm({
            title: 'Are you sure you want to delete this invoice?',
            icon: <ExclamationCircleOutlined />,
            onOk: async () => {
                try {
                    await userApi.deleteInvoice(invoiceId);
                    setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId));
                    toast.success('Invoice deleted successfully');
                } catch (error) {
                    console.error('Error deleting invoice:', error);
                    toast.error('Failed to delete invoice.');
                }
            },
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            render: (id) => <Tooltip title={id}>{id.length > 10 ? `${id.slice(0, 6)}...` : id}</Tooltip>,
        },
        {
            title: 'Method',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            filters: [
                { text: 'CARD', value: 'CARD' },
                { text: 'ACCOUNT_BALANCE', value: 'ACCOUNT_BALANCE' },
            ],
            onFilter: (value, record) => record.paymentMethod === value,
            width: 150,
        },
        {
            title: 'Status',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status) => <Badge color={status === 'Paid' ? 'red' : 'blue'} text={status} />,
            width: 120,
        },
        {
            title: 'Reason',
            dataIndex: 'transactionType',
            key: 'transactionType',
            filters: [
                { text: 'BOOKING', value: 'BOOKING' },
                { text: 'REGISTRATION_FEE', value: 'REGISTRATION_FEE' },
                { text: 'REFUND', value: 'REFUND' },
            ],
            onFilter: (value, record) => record.transactionType === value,
            width: 160,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: formatCurrency,
            sorter: (a, b) => a.amount - b.amount,
            width: 140,
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => new Date(createdAt).toLocaleString('vi-VN', { hour12: false }),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            defaultSortOrder: 'descend', // Mặc định sắp xếp giảm dần (mới nhất lên đầu)
            width: 260,
        },

        // {
        //     title: 'Actions',
        //     key: 'actions',
        //     render: (_, invoice) => (
        //         <Button
        //             type='default'
        //             style={{ background: '#9abacb ', color: '#fff' }}
        //             onClick={() => handleDeleteInvoice(invoice.id)}
        //         >
        //             Delete
        //         </Button>
        //     ),
        //     width: 120,
        // },
    ];

    return (
        <div className={styles.myInvoiceContainer}>
            {isLoading && <Loading />}
            <Table
                columns={columns}
                dataSource={invoices.map((invoice) => ({ ...invoice, key: invoice.id }))}
                pagination={{ pageSize: 5, showSizeChanger: false }}
            />
            {!isLoading && invoices.length > 0 && <InvoiceChart invoices={invoices} />}
        </div>
    );
}

export default MyInvoice;
