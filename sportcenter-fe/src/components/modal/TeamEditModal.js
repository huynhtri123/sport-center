import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Upload, Avatar, Spin, Space } from 'antd';
import { PlusOutlined, UploadOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './editTeamModal.module.scss';

function TeamEditModal({ isOpen, team, onClose, onSave }) {
    const [teamData, setTeamData] = useState({ ...team });
    const [previewImage, setPreviewImage] = useState(team.teamLogoUrl);
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            form.setFieldsValue({ ...team });
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, team, form]);

    const handleImageChange = (info) => {
        if (info.file) {
            const file = info.file; // Sử dụng trực tiếp file
            const imageUrl = URL.createObjectURL(file); // Tạo URL tạm thời cho preview
            setPreviewImage(imageUrl);
            setTeamData((prevData) => ({ ...prevData, teamLogoFile: file }));
        }
    };

    const handlePlayerChange = (index, key, value) => {
        const updatedPlayers = [...teamData.players];
        updatedPlayers[index][key] = value;
        setTeamData({ ...teamData, players: updatedPlayers });
    };

    const handleAddPlayer = () => {
        setTeamData({
            ...teamData,
            players: [...teamData.players, { name: '', position: '', number: '' }],
        });
    };

    const handleRemovePlayer = (index) => {
        const updatedPlayers = teamData.players.filter((_, i) => i !== index);
        setTeamData({ ...teamData, players: updatedPlayers });
    };

    const handleSubmit = async () => {
        if (!teamData.teamName.trim()) {
            Modal.error({
                title: 'Validation Error',
                content: 'Team name is required.',
            });
            return;
        }

        if (teamData.players.some((player) => !player.name.trim())) {
            Modal.error({
                title: 'Validation Error',
                content: 'Each player must have a name.',
            });
            return;
        }

        setIsLoading(true);
        try {
            const file = teamData.teamLogoFile;
            await onSave(teamData, file);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Modal
                title='UPDATE TEAM INFO'
                open={isOpen}
                onCancel={onClose}
                onOk={handleSubmit}
                confirmLoading={isLoading}
                width={600}
            >
                {isLoading && <Spin size='large' style={{ display: 'block', textAlign: 'center', marginBottom: 15 }} />}
                <Form form={form} layout='vertical'>
                    <Form.Item
                        label='Team Name'
                        name='teamName'
                        rules={[{ required: true, message: 'Please enter team name' }]}
                    >
                        <Input
                            value={teamData.teamName}
                            onChange={(e) => setTeamData({ ...teamData, teamName: e.target.value })}
                        />
                    </Form.Item>

                    <Form.Item label='Team Logo'>
                        <Space direction='vertical' align='center'>
                            <Avatar size={100} src={previewImage} icon={<UserOutlined />} />
                            <Upload showUploadList={false} beforeUpload={() => false} onChange={handleImageChange}>
                                <Button icon={<UploadOutlined />}>Upload Logo</Button>
                            </Upload>
                        </Space>
                    </Form.Item>

                    <Form.Item label='Players'>
                        {teamData.players.map((player, index) => (
                            <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align='start'>
                                <Input
                                    placeholder='Name'
                                    value={player.name}
                                    onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                                    required
                                />
                                <Input
                                    placeholder='Position'
                                    value={player.position}
                                    onChange={(e) => handlePlayerChange(index, 'position', e.target.value)}
                                />
                                <Input
                                    placeholder='Number'
                                    type='number'
                                    value={player.number}
                                    onChange={(e) => handlePlayerChange(index, 'number', e.target.value)}
                                />
                                <Button
                                    type='text'
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemovePlayer(index)}
                                    danger
                                />
                            </Space>
                        ))}
                        <Button type='dashed' onClick={handleAddPlayer} icon={<PlusOutlined />} block>
                            Add Player
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default TeamEditModal;
