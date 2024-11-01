import React from 'react';
import styles from '../../../assets/css/Profile/myTournaments.module.scss';

function MyTournaments({ tournaments }) {
    return (
        <div className={styles.myTournamentsContainer}>
            {tournaments.length > 0 ? (
                tournaments.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)
            ) : (
                <p>No tournaments available.</p>
            )}
        </div>
    );
}

function TournamentCard({ tournament }) {
    return (
        <div className={styles.tournamentCard}>
            <h4>{tournament.tournamentName}</h4>
            <p>Sport: {tournament.sport?.sportName}</p>
            <p>Start Date: {new Date(tournament.startDate).toLocaleDateString()}</p>
            <p>End Date: {new Date(tournament.endDate).toLocaleDateString()}</p>
            <p>Registered Teams: {tournament.registeredTeamIds.length}</p>
            <p>Max Teams: {tournament.maxTeams}</p>
        </div>
    );
}

export default MyTournaments;
