import React, { useEffect, useState } from 'react';
import styles from '../../../assets/css/Tournament/tournamentDetail.module.scss';
import { useTournament } from '../../../customs/hooks';
import Button from '../../../components/Button/Button';
import tournamentApi from '../../../services/api/tournament/tournamentApi';
import { useNavigate } from 'react-router-dom';
import formatCurrency from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/DateTimeConverter';

const TournamentDetail = () => {
    const [tournament, setTournament] = useTournament();
    const [registeredTeams, setRegisteredTeams] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedTournament = localStorage.getItem('selectedTournament');
        if (storedTournament) {
            setTournament(JSON.parse(storedTournament));
        }
    }, [setTournament]);

    const getRegisteredTeams = async (tournamentId) => {
        try {
            const teamResponse = await tournamentApi.getRegistedTeams(tournamentId);
            // console.log(teamResponse);
            setRegisteredTeams(teamResponse.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (tournament && tournament.registeredTeamIds) {
            getRegisteredTeams(tournament.id);
        }
    }, [tournament]);
    const numberOfParticipants = tournament.registeredTeamIds ? tournament.registeredTeamIds.length : 0;

    const prizes = tournament.prizes || [];

    const handleRegister = () => {
        navigate('/tournament/register');
        console.log('Registering for tournament...');
    };

    return (
        <div className={styles.tournamentDetailContainer}>
            {/* Section 1: Thông tin giải đấu */}
            <div className={styles.infoSection}>
                <div className={styles.tournamentInfo}>
                    <h2 className={styles.tournamentName}>
                        <i className='fa-solid fa-trophy me-3'></i>
                        {tournament.tournamentName}
                    </h2>
                    <div className={styles.sportName}>{tournament.sport?.sportName}</div>
                    <div className={styles.dateInfo}>
                        <i className='fa-regular fa-clock'></i>
                        <span>Start Date: </span>
                        <time>
                            {formatDate(tournament.startDate)}
                            {', '}
                            {new Date(tournament.startDate).toLocaleTimeString()}
                        </time>
                    </div>
                    <div className={styles.dateInfo}>
                        <i className='fa-regular fa-clock'></i>
                        <span>End Date: </span>
                        <time>
                            {formatDate(tournament.endDate)}
                            {', '}
                            {new Date(tournament.endDate).toLocaleTimeString()}
                        </time>
                    </div>
                    <div className={styles.dateInfo}>
                        <i className='fa-solid fa-hourglass-start'></i>
                        <span>Registration Deadline: </span>
                        <time>
                            {formatDate(tournament.registrationDeadline)}
                            {', '}
                            {new Date(tournament.registrationDeadline).toLocaleTimeString()}
                        </time>
                    </div>

                    <div>
                        <span>Max Teams:</span> {tournament.maxTeams}
                    </div>
                    <div>
                        <span>Registration Fee:</span>
                        <span className={styles.registrationFee}>
                            {formatCurrency(tournament.registrationFee || 0)}
                        </span>
                    </div>

                    <Button className={styles.registerButton} onClick={handleRegister}>
                        Register for Tournament
                    </Button>
                </div>
                <div className={styles.thumbnailContainer}>
                    <img
                        src={tournament.thumUrl}
                        alt={`${tournament.tournamentName} Thumbnail`}
                        className={styles.thumbnail}
                    />
                </div>
            </div>

            {/* Section 2: Giải thưởng */}
            <section className={styles.prizes}>
                <h2>
                    <i className='fa-solid fa-award me-3'></i>
                    Prizes
                </h2>
                {prizes.length > 0 ? (
                    <ul>
                        {prizes.map((prize, index) => (
                            <li key={index}>
                                <strong className='me-2'>Position {prize.position}:</strong> {prize.description} -
                                <strong className='ms-1'> {formatCurrency(prize.reward || 0)}</strong>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No prizes available.</p>
                )}
            </section>

            <div className={styles.rulesSection}>
                <h2>
                    <i className='fa-solid fa-book me-3'></i>
                    Rules
                </h2>
                <ul className={styles.rulesList}>
                    {tournament.rules && tournament.rules.length > 0 ? (
                        tournament.rules.map((rule, index) => (
                            <li key={index} className={styles.ruleItem}>
                                <i className='fa-solid fa-check-circle'></i>
                                <span>{rule}</span>
                            </li>
                        ))
                    ) : (
                        <p className={styles.noRules}>No rules available for this tournament.</p>
                    )}
                </ul>
            </div>

            {/* Section 3: Các đội tham gia */}
            <section className={styles.registeredTeams}>
                <h2>
                    <i className='fa-solid fa-people-group me-3'></i>
                    Registered Teams ({numberOfParticipants})
                </h2>
                {registeredTeams && registeredTeams.length > 0 ? (
                    <ul>
                        {registeredTeams.map((team) => (
                            <li key={team.id} className={styles.teamItem}>
                                <img src={team.teamLogoUrl} alt={`${team.teamName} Logo`} className={styles.teamLogo} />
                                <div>
                                    <strong>{team.teamName}</strong>
                                    <ul>
                                        {team.players.map((player, index) => (
                                            <li key={index}>
                                                {player.name} (#{player.number}) - {player.position}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No teams registered yet.</p>
                )}
            </section>
        </div>
    );
};

export default TournamentDetail;
