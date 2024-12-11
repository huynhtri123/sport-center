import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import styles from '../../../assets/css/Tournament/tournament.module.scss';
import tournamentApi from '../../../services/api/tournamentApi';
import { useGetSports } from '../../../customs/hooks';
import { useTournament } from '../../../customs/hooks';
import { useNavigate } from 'react-router-dom';
import formatCurrency from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/DateTimeConverter';

const TournamentHome = () => {
    const [sports, setSports] = useGetSports();
    const [tournaments, setTournaments] = useState([]);
    const [selectedSport, setSelectedSport] = useState('');
    const [tournament, setTournament] = useTournament();
    const [isAscending, setIsAscending] = useState(true); // Trạng thái sắp xếp
    const navigate = useNavigate();

    const getTournaments = async () => {
        try {
            const tournamentsResponse = await tournamentApi.getAllActive(0, 100);
            setTournaments(tournamentsResponse.data.content);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load tournaments');
        }
    };

    useEffect(() => {
        getTournaments();
    }, []);

    const handleSportChange = (e) => {
        setSelectedSport(e.target.value);
    };

    // sort by date
    const [isStartDateAscending, setIsStartDateAscending] = useState(true);
    const [isEndDateAscending, setIsEndDateAscending] = useState(true);

    const handleSortByStartDate = () => {
        setIsStartDateAscending(!isStartDateAscending);
        const sortedTournaments = [...tournaments].sort(
            // dựa vào hàm callback (hàm so sánh theo tiêu chí nào đó) trong sort,
            // nếu âm -> a đc xếp trước b, dương -> b đc xếp trước a
            (a, b) =>
                isStartDateAscending
                    ? new Date(a.startDate) - new Date(b.startDate) // Tăng dần
                    : new Date(b.startDate) - new Date(a.startDate) // Giảm dần
        );
        setTournaments(sortedTournaments);
    };

    const handleSortByEndDate = () => {
        setIsEndDateAscending(!isEndDateAscending);
        const sortedTournaments = [...tournaments].sort(
            (a, b) =>
                isEndDateAscending
                    ? new Date(a.endDate) - new Date(b.endDate) // Tăng dần
                    : new Date(b.endDate) - new Date(a.endDate) // Giảm dần
        );
        setTournaments(sortedTournaments);
    };

    const handleViewDetails = async (tournamentId) => {
        try {
            const tournamentResponse = await tournamentApi.getById(tournamentId);
            setTournament(tournamentResponse.data);
            localStorage.setItem('selectedTournament', JSON.stringify(tournamentResponse.data));
            navigate('/tournament/detail');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.tournamentHome}>
            <div className={styles.banner}>
                <div className={styles.bannerContent}>Join Exciting Tournaments and Win Big Prizes!</div>
                <div className={styles.filterContainer}>
                    <label htmlFor='sport-filter'>Choose your favorite:</label>
                    <select id='sport-filter' onChange={handleSportChange} value={selectedSport}>
                        <option value=''>All Sports</option>
                        {sports.map((sport, index) => (
                            <option key={index} value={sport.sportName}>
                                {sport.sportName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Thêm nút sort */}
            <div className={styles.sortContainer}>
                <div className={styles.sortOption} onClick={handleSortByStartDate}>
                    <i className={isStartDateAscending ? 'fas fa-sort-amount-up' : 'fas fa-sort-amount-down'} />
                    <label>Start Date</label>
                </div>
                <div className={styles.sortOption} onClick={handleSortByEndDate}>
                    <i className={isEndDateAscending ? 'fas fa-sort-amount-up' : 'fas fa-sort-amount-down'} />
                    <label>End Date </label>
                </div>
            </div>

            <div className={styles.timeline}>
                {tournaments
                    .filter((tournament) => !selectedSport || tournament.sport.sportName === selectedSport)
                    .map((tournament) => (
                        <div key={tournament.id} className={styles.tournamentCard}>
                            <div className={styles.header}>
                                <span>{tournament.tournamentName}</span>
                                <span>{tournament.sport.sportName}</span>
                            </div>
                            <div className={styles.content}>
                                <div className={styles.info}>
                                    <div className={styles.dateColumn}>
                                        <p className={styles.date}>
                                            <strong>Start Date:</strong> {formatDate(tournament.startDate)}
                                        </p>
                                        <p className={styles.time}>
                                            {new Date(tournament.startDate).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className={styles.dateColumn}>
                                        <p className={styles.date}>
                                            <strong>End Date:</strong> {formatDate(tournament.endDate)}
                                        </p>
                                        <p className={styles.time}>
                                            {new Date(tournament.endDate).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className={styles.dateColumn}>
                                        <strong>Prizes:</strong>
                                        {tournament.prizes && tournament.prizes.length > 0 ? (
                                            <ul>
                                                {tournament.prizes.map((prize, index) => (
                                                    <li key={index}>
                                                        <span>Position {prize.position && prize.position}:</span>{' '}
                                                        {formatCurrency(prize.reward && prize.reward)}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No prizes available</p>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.thumbnailContainer}>
                                    <div className={styles.thumbnail}>
                                        <img src={tournament.thumUrl} alt={tournament.tournamentName} />
                                    </div>
                                    <div className={styles.viewDetailsContainer}>
                                        <button
                                            className={styles.viewDetailsButton}
                                            onClick={() => handleViewDetails(tournament.id)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default TournamentHome;
