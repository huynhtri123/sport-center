import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import styles from '../../../assets/css/Tournament/tournament.module.scss';
import tournamentApi from '../../../services/api/tournamentApi';
import { useGetSports } from '../../../customs/hooks';
import { formatDateToZoneDateTime } from '../../../utils/DateTimeConverter';
import { useTournament } from '../../../customs/hooks';
import { useNavigate } from 'react-router-dom';

const TournamentHome = () => {
    // eslint-disable-next-line no-unused-vars
    const [sports, setSports] = useGetSports();
    const [tournaments, setTournaments] = useState([]);
    const [selectedSport, setSelectedSport] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [tournament, setTournament] = useTournament();
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

    const handleViewDetails = async (tournamentId) => {
        // toast.info(`Viewing details for tournament ID: ${tournamentId}`);
        try {
            const tournamentResponse = await tournamentApi.getById(tournamentId);
            // console.log(tournamentResponse);
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

            <div className={styles.tournamentList}>
                {tournaments
                    .filter((tournament) => !selectedSport || tournament.sport.sportName === selectedSport)
                    .map((tournament) => (
                        <div key={tournament.id} className={styles.tournamentCard}>
                            <img src={tournament.thumUrl} alt={tournament.tournamentName} />
                            <div className={styles.content}>
                                <h2>{tournament.tournamentName}</h2>
                                <p>
                                    <strong>Sport:</strong> {tournament.sport.sportName}
                                </p>
                                <p>
                                    <strong>Start Date:</strong> {formatDateToZoneDateTime(tournament.startDate)}
                                </p>
                                <p>
                                    <strong>End Date:</strong> {formatDateToZoneDateTime(tournament.endDate)}
                                </p>

                                <button onClick={() => handleViewDetails(tournament.id)} className={styles.detailsBtn}>
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default TournamentHome;
