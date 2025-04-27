import React from 'react';
import { Modal, Form, Button, InputNumber } from 'antd';
import clsx from 'clsx';
import styles from './matchList.module.scss';

export default function MatchList({
    roundMatches,
    openUpdateModal,
    selectedMatch,
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    updateForm,
    handleUpdateResult,
    role, // This will be passed in to handle role-based logic
}) {
    return (
        <ul className={styles.matchList}>
            {roundMatches.map((roundMatch) => (
                <li key={roundMatch.id} className={styles.matchItem}>
                    <div className={styles.matchRow}>
                        <div className={styles.matchMeta}>
                            <p className={styles.matchInfo}>
                                {roundMatch.startTime ? new Date(roundMatch.startTime).toLocaleString() : 'N/A'}
                            </p>
                            <p>-</p>
                            <p className={styles.matchInfo}>
                                {roundMatch.endTime ? new Date(roundMatch.endTime).toLocaleString() : 'N/A'}
                            </p>
                        </div>
                        <div className={styles.team}>
                            <img
                                src={roundMatch.teamA.teamLogoUrl}
                                alt={roundMatch.teamA.teamName}
                                className={styles.teamLogo}
                            />
                            <span className={styles.teamName}>{roundMatch.teamA.teamName}</span>
                        </div>

                        <div className={styles.score}>
                            {roundMatch.status === 'COMPLETED' ? (
                                <span className={styles.completedScore}>
                                    {roundMatch.scoreA} - {roundMatch.scoreB}
                                </span>
                            ) : role === 'ADMIN' ? ( // Only show the update button for ADMIN role
                                <div className={styles.updateButtonWrapper}>
                                    <span className={styles.updateResultSpan}>Update result</span>
                                    <i
                                        className={clsx('fa-solid fa-pen-to-square', styles.updateButton)}
                                        onClick={() => openUpdateModal(roundMatch)}
                                    ></i>
                                </div>
                            ) : (
                                <span className={styles.lockedResult}>-</span>
                            )}
                            <Modal
                                title={`Update Result for Match ${selectedMatch?.teamA?.teamName} vs ${selectedMatch?.teamB?.teamName}`}
                                open={isUpdateModalOpen}
                                onCancel={() => setIsUpdateModalOpen(false)}
                                footer={null}
                            >
                                <Form form={updateForm} onFinish={handleUpdateResult} layout='vertical'>
                                    <Form.Item
                                        name='scoreA'
                                        label={`Score for ${selectedMatch?.teamA?.teamName || 'Team A'}`}
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Enter score for Team A',
                                            },
                                        ]}
                                    >
                                        <InputNumber min={0} style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Form.Item
                                        name='scoreB'
                                        label={`Score for ${selectedMatch?.teamB?.teamName || 'Team B'}`}
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Enter score for Team B',
                                            },
                                        ]}
                                    >
                                        <InputNumber min={0} style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type='primary' htmlType='submit' block>
                                            Update Result
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Modal>
                        </div>

                        <div className={styles.team}>
                            <img
                                src={roundMatch.teamB.teamLogoUrl}
                                alt={roundMatch.teamB.teamName}
                                className={styles.teamLogo}
                            />
                            <span className={styles.teamName}>{roundMatch.teamB.teamName}</span>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
