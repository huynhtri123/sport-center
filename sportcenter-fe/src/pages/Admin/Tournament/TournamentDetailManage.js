/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Form, Input, Button, InputNumber } from 'antd';
import { toast } from 'react-toastify';
import styles from '../../../assets/css/Admin/tournament/tournamentDetailManage.module.scss';
import tournamentApi from '../../../services/api/tournament/tournamentApi';
import matchApi from '../../../services/api/match/matchApi';
import RulePrizeSection from './RulePrizeSection';
import RegistedTeams from './RegistedTeams';
import Standings from './Standings';
import MatchList from './MatchList';

export default function TournamentDetailManage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [registedTeams, setRegistedTeams] = useState([]);
    const [advancingTeams, setAdvancingTeams] = useState([]);
    const [standings, setStandings] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [role, setRole] = useState('ADMIN');
    const [updateForm] = Form.useForm();
    const [form] = Form.useForm();

    useEffect(() => {
        fetchTournament();
        const role = localStorage.getItem('role');
        if (role) {
            setRole(role);
        }
    }, []);

    useEffect(() => {
        if (tournament) {
            getRegistedTeams(tournament.id);
            getAdvancingTeams(tournament.id);
            getStandings(tournament.id);
            getMatches(tournament.id);
        }
    }, [tournament]);

    const fetchTournament = async () => {
        try {
            const response = await tournamentApi.getById(id);
            if (response && response.data) {
                setTournament(response.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getRegistedTeams = async (tournamentId) => {
        try {
            const response = await tournamentApi.getRegistedTeams(tournamentId);
            if (response && response.data) {
                setRegistedTeams(response.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getAdvancingTeams = async (tournamentId) => {
        try {
            const response = await tournamentApi.getAdvancingTeams(tournamentId);
            if (response && response.data) {
                setAdvancingTeams(response.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getStandings = async (tournamentId) => {
        try {
            const response = await tournamentApi.getStandings(tournamentId);
            if (response && response.data) {
                setStandings(response.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getMatches = async (tournamentId) => {
        try {
            const response = await matchApi.getByTournament(tournamentId);
            if (response && response.data) {
                setMatches(response.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getTeamNameById = (teamId) => {
        const team = registedTeams.find((team) => team.id === teamId);
        return team ? team.teamName : teamId;
    };

    const openUpdateModal = (match) => {
        setSelectedMatch(match);
        updateForm.setFieldsValue({
            scoreA: match.scoreA ?? 0,
            scoreB: match.scoreB ?? 0,
        });
        setIsUpdateModalOpen(true);
    };

    const handleUpdateResult = async (values) => {
        try {
            const request = {
                matchId: selectedMatch.id,
                scoreA: values.scoreA,
                scoreB: values.scoreB,
            };
            const response = await matchApi.updateResult(request);
            console.log(response);
            setIsUpdateModalOpen(false);
            getMatches(tournament.id);
            getAdvancingTeams(tournament.id);
            getStandings(tournament.id);
            toast.success(response.message);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const createNextRound = async (values) => {
        setLoading(true);
        try {
            const request = {
                tournamentId: tournament.id,
                firstStartTime: new Date(values.firstStartTime).toISOString(),
                firstEndTime: new Date(values.firstEndTime).toISOString(),
                gapBetweenMatches: parseInt(values.gapBetweenMatches, 10),
            };
            const response = await matchApi.createMatches(request);
            getMatches(tournament.id);
            getAdvancingTeams(tournament.id);
            getStandings(tournament.id);
            toast.success(response.message);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setIsModalOpen(false);
            form.resetFields();
        }
    };

    const handleConfirmAward = () => {
        Modal.confirm({
            title: 'Are you sure you want to award the prizes?',
            content: 'This action cannot be undone.',
            okText: 'OK',
            cancelText: 'Cancel',
            onOk: () => handleAward(), // gọi function async từ function thường
        });
    };

    const handleAward = async () => {
        try {
            const response = await matchApi.award(tournament.id);
            toast.success(response.message);
            await fetchTournament();
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'An unexpected error occurred.';
            // toast.error(errorMessage);
            console.error(errorMessage);
        }
    };

    if (!tournament) return <div className={styles.loading}>Loading...</div>;

    const isFirstRound = matches.every((match) => match.round === 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                {role === 'ADMIN' && (
                    <button onClick={() => navigate(-1)} className={styles.backButton}>
                        ← Back to Admin Dashboard
                    </button>
                )}
                <h1 className={styles.title}>Tournament Progress</h1>
            </header>

            <main className={styles.mainGrid}>
                <section className={styles.tournamentInfo}>
                    <div className={styles.thumbnail}>
                        {tournament.thumUrl && <img src={tournament.thumUrl} alt='Thumbnail' />}
                    </div>
                </section>

                <section className={styles.rulesPrizes}>
                    <RulePrizeSection tournament={tournament}></RulePrizeSection>
                </section>

                <section className={styles.teams}>
                    <RegistedTeams registedTeams={registedTeams}></RegistedTeams>
                </section>

                <section className={styles.standingsMatches}>
                    <Standings standings={standings} registedTeams={registedTeams}></Standings>
                </section>

                <section className={`${styles.matchesSection} ${styles.fullWidth}`}>
                    <h3 className={styles.matchSectionTitle}>Matches</h3>
                    <div className={styles.matches}>
                        {matches.map((match, index, self) => {
                            if (index === self.findIndex((m) => m.round === match.round)) {
                                const roundMatches = self.filter((m) => m.round === match.round);
                                return (
                                    <div key={match.round} className={styles.roundGroup}>
                                        <h4 className={styles.roundTitle}>Round {match.round}</h4>
                                        <MatchList
                                            roundMatches={roundMatches}
                                            openUpdateModal={openUpdateModal}
                                            selectedMatch={selectedMatch}
                                            isUpdateModalOpen={isUpdateModalOpen}
                                            setIsUpdateModalOpen={setIsUpdateModalOpen}
                                            updateForm={updateForm}
                                            handleUpdateResult={handleUpdateResult}
                                            role={role}
                                        ></MatchList>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>

                    {/* Danh sách đội được đi tiếp (khi giải đấu chưa kết thúc) */}
                    {!tournament?.done && !tournament?.winners?.length > 0 && (
                        <div className={styles.advancingTeamsSection}>
                            <h4 className={styles.sectionTitle}>Teams Advancing to the Next Round</h4>

                            <div className={styles.advancingTeamList}>
                                {(advancingTeams.length > 0 ? advancingTeams : registedTeams).map((teamId, index) => {
                                    const team = getTeamNameById(teamId);
                                    if (!team) return null;
                                    return (
                                        <div key={index} className={styles.team}>
                                            <img
                                                src={team.teamLogoUrl}
                                                alt={team.teamName}
                                                className={styles.teamLogo}
                                            />
                                            <span className={styles.teamName}>{team.teamName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Hiển thị danh sách đội thắng */}
                    {tournament?.done && tournament?.winners?.length > 0 && (
                        <div className={styles.winnerList}>
                            <h4 className={styles.winnerTitle}>
                                <img
                                    src='https://cdn-icons-png.flaticon.com/128/1599/1599828.png'
                                    alt='winners ic'
                                    className={styles.winnersIc}
                                />
                                Winners
                            </h4>
                            {tournament.winners.map((winner, index) => {
                                // Lấy thông tin đội từ registedTeams thông qua teamId
                                const team = registedTeams.find((team) => team.id === winner.teamId);
                                if (!team) return null; // Nếu không tìm thấy đội, không hiển thị
                                return (
                                    <div key={index} className={styles.team}>
                                        <img src={team.teamLogoUrl} alt={team.teamName} className={styles.teamLogo} />
                                        <span className={styles.teamName}>
                                            {team.teamName} - {winner.position} place
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {role === 'ADMIN' && !tournament?.done && (
                        <div className={styles.tournamentActions}>
                            <Button type='primary' onClick={() => setIsModalOpen(true)} disabled={loading}>
                                {loading ? 'Creating...' : isFirstRound ? 'Start Tournament' : 'Create Next Round'}
                            </Button>
                            <Button className='ms-2' type='primary' onClick={handleConfirmAward} disabled={loading}>
                                Award Prizes
                            </Button>
                        </div>
                    )}
                </section>
            </main>

            <Modal title='Create Next Round' open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form form={form} onFinish={createNextRound} layout='vertical'>
                    <Form.Item
                        name='firstStartTime'
                        label='First Start Time'
                        rules={[{ required: true, message: 'Please enter first start time!' }]}
                    >
                        <Input
                            type='datetime-local'
                            min={new Date().toISOString().slice(0, 16)} // Khóa không cho chọn trước thời gian hiện tại
                            placeholder='Enter start time'
                        />
                    </Form.Item>

                    <Form.Item
                        name='firstEndTime'
                        label='First End Time'
                        rules={[{ required: true, message: 'Please enter first end time!' }]}
                    >
                        <Input
                            type='datetime-local'
                            min={new Date().toISOString().slice(0, 16)} // Khóa không cho chọn trước thời gian hiện tại
                            placeholder='Enter end time'
                        />
                    </Form.Item>

                    <Form.Item
                        name='gapBetweenMatches'
                        label='Gap Between Matches'
                        rules={[
                            { required: true, message: 'Please enter gap between matches!' },
                            { type: 'number', min: 1, message: 'Gap must be at least 1 minute!' },
                        ]}
                    >
                        <InputNumber placeholder='Enter gap time (e.g., 15 minutes)' style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type='primary' htmlType='submit' loading={loading}>
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
