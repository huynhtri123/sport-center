import React from 'react';
import styles from './standings.module.scss';

export default function Standings({ standings, registedTeams }) {
    const getTeamNameById = (teamId) => {
        const team = registedTeams.find((team) => team.id === teamId);
        return team ? team.teamName : teamId;
    };

    // sort theo điểm, nếu điểm bằng thì sort theo GA
    const sortedStandings = [...standings].sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        return b.goalsFor - a.goalsFor;
    });

    return (
        <>
            <div className={styles.standings}>
                <h3 className={styles.standingsTitle}>Standings</h3>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Team</th>
                            <th>Played</th>
                            <th>Won</th>
                            <th>Lost</th>
                            <th>GF</th>
                            <th>GA</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStandings.map((entry, i) => (
                            <tr key={entry.teamId}>
                                <td>{i + 1}</td> {/* Cột thứ tự */}
                                <td>{getTeamNameById(entry.teamId)}</td>
                                <td>{entry.played}</td>
                                <td>{entry.won}</td>
                                <td>{entry.lost}</td>
                                <td>{entry.goalsFor}</td>
                                <td>{entry.goalsAgainst}</td>
                                <td>{entry.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
