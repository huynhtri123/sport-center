import React, { useEffect, useState } from 'react';
import discountApi from '../../../services/api/discountConfig/discountApi';
import { DiscountType } from '../../../utils/enums/DiscountType';
import styles from '../../../assets/css/admin/discountConfig/discountConfig.module.scss';

import {
    Table,
    Button,
    Modal,
    Form,
    InputNumber,
    Select,
    message,
    Popconfirm,
    Space,
    Typography,
    Divider,
    Row,
    Col,
    Tag,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
// eslint-disable-next-line no-unused-vars
const { Title, Text } = Typography;

export default function DiscountConfig() {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await discountApi.getAll();
            setDiscounts(res.data);
        } catch {
            message.error('Failed to load discount configs.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (record = null) => {
        setEditing(record);
        setIsModalOpen(true);
        if (record) {
            form.setFieldsValue({
                ...record,
                amountDiscount: record.amountDiscount || {},
                monthDiscountList: record.monthDiscountList || [],
            });
        } else {
            form.resetFields();
        }
    };

    const handleSubmit = async (values) => {
        const isDuplicate = discounts.some((d) => d.type === values.type && d.id !== (editing?.id ?? null));
        if (isDuplicate) {
            return message.error('A discount config with this type already exists.');
        }

        const threshold = values.amountDiscount?.threshold;
        if (threshold !== undefined && (threshold < 0 || threshold > 100)) {
            return message.error('Threshold must be between 0–100%');
        }

        const months = values.monthDiscountList?.map((item) => item.month) || [];
        const hasDuplicate = (arr) => new Set(arr).size !== arr.length;
        if (hasDuplicate(months)) {
            return message.error('Month values must be unique.');
        }

        try {
            if (editing) {
                await discountApi.update(editing.id, values);
                message.success('Updated successfully.');
            } else {
                await discountApi.create(values);
                message.success('Created successfully.');
            }
            setIsModalOpen(false);
            fetchData();
        } catch {
            message.error('Operation failed.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await discountApi.softDelete(id);
            message.success('Deleted successfully.');
            fetchData();
        } catch {
            message.error('Delete failed.');
        }
    };

    const columns = [
        {
            title: 'Type',
            dataIndex: 'type',
            render: (type) => <Text>{type.replaceAll('_', ' ')}</Text>,
        },
        {
            title: 'Low Booking Rate',
            dataIndex: 'amountDiscount',
            render: (discount) =>
                discount ? (
                    <Text type='success'>
                        &lt; {discount.threshold}% → {discount.discount}%
                    </Text>
                ) : (
                    '-'
                ),
        },
        {
            title: 'Package Duration',
            dataIndex: 'monthDiscountList',
            render: (list) =>
                list?.length ? (
                    <Space direction='vertical'>
                        {list.map((d, idx) => (
                            <Tag key={idx} color='blue'>
                                {d.month} months → {d.discount}%
                            </Tag>
                        ))}
                    </Space>
                ) : (
                    <Text type='secondary'>-</Text>
                ),
        },
        {
            title: 'Actions',
            render: (_, record) => (
                <Space>
                    <Button type='link' onClick={() => openModal(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title='Are you sure you want to delete this config?'
                        onConfirm={() => handleDelete(record.id)}
                        okText='Yes'
                        cancelText='No'
                    >
                        <Button danger type='link'>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <Button type='primary' onClick={() => openModal()}>
                Add New Discount
            </Button>

            <Table
                columns={columns}
                dataSource={discounts}
                rowKey='id'
                loading={loading}
                style={{ marginTop: 24 }}
                bordered
            />

            <Modal
                title={editing ? 'Edit Discount Config' : 'Add Discount Config'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                okText={editing ? 'Update' : 'Create'}
                width={750}
                onOk={async () => {
                    try {
                        const values = await form.validateFields();
                        handleSubmit(values);
                    } catch (errorInfo) {
                        console.log('Validation Failed:', errorInfo);
                    }
                }}
            >
                <Form form={form} layout='vertical'>
                    <Divider orientation='left'>Discount Type</Divider>
                    <Form.Item
                        name='type'
                        label='Discount Type'
                        rules={[{ required: true, message: 'Please select a discount type' }]}
                    >
                        <Select placeholder='Select a discount type'>
                            {Object.keys(DiscountType).map((key) => (
                                <Option key={key} value={DiscountType[key]}>
                                    {key.replaceAll('_', ' ')}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Divider orientation='left'>Low Booking Rate Discount</Divider>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name={['amountDiscount', 'threshold']}
                                label='Threshold (%)'
                                rules={[
                                    { required: true, message: 'Enter threshold' },
                                    { type: 'number', min: 0, max: 100, message: 'Must be between 0–100%' },
                                ]}
                            >
                                <InputNumber placeholder='e.g. 50' style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name={['amountDiscount', 'discount']}
                                label='Discount (%)'
                                rules={[
                                    { required: true, message: 'Enter discount' },
                                    { type: 'number', min: 0, max: 100, message: 'Must be between 0–100%' },
                                ]}
                            >
                                <InputNumber placeholder='e.g. 20' style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation='left'>Package Booking Discounts</Divider>
                    <Form.List name='monthDiscountList'>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...rest }) => (
                                    <Row key={key} gutter={16} align='middle'>
                                        <Col span={10}>
                                            <Form.Item
                                                {...rest}
                                                name={[name, 'month']}
                                                label='Number of Months'
                                                rules={[
                                                    { required: true, message: 'Enter number of months' },
                                                    {
                                                        type: 'number',
                                                        min: 1,
                                                        max: 12,
                                                        message: 'Must be between 1–12',
                                                    },
                                                ]}
                                            >
                                                <InputNumber placeholder='e.g. 3' style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={10}>
                                            <Form.Item
                                                {...rest}
                                                name={[name, 'discount']}
                                                label='Discount (%)'
                                                rules={[
                                                    { required: true, message: 'Enter discount' },
                                                    {
                                                        type: 'number',
                                                        min: 0,
                                                        max: 100,
                                                        message: 'Must be between 0–100%',
                                                    },
                                                ]}
                                            >
                                                <InputNumber placeholder='e.g. 15' style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Button icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button onClick={() => add()} icon={<PlusOutlined />} block type='dashed'>
                                        Add Package Discount
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </div>
    );
}
