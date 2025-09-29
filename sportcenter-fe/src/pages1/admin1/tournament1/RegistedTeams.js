import React from 'react';
import styles from './registedTeams.module.scss';

export default function RegistedTeams({ registedTeams }) {
    return (
        <>
            <h2 className={styles.registedTeamsTitle}>Registered Teams</h2>
            <ul>
                {registedTeams.map((team) => (
                    <li key={team.userId} className={styles.teamItem}>
                        <div className={styles.teamHeader}>
                            <img src={team.teamLogoUrl} alt={`${team.teamName} Logo`} className={styles.teamLogo} />
                            <div className={styles.teamInfo}>
                                <strong className={styles.teamName}>{team.teamName}</strong>
                                <p className={styles.teamUserId}>ID: {team.id}</p>
                            </div>
                        </div>
                        <div className={styles.players}>
                            <h4>Players</h4>
                            <ul>
                                {team.players.map((player, index) => (
                                    <li key={index} className={styles.player}>
                                        <span className={styles.playerName}>{player.name}</span>
                                        <span className={styles.playerPosition}>{player.position || 'N/A'}</span>
                                        <span className={styles.playerNumber}>
                                            {player.number ? `#${player.number}` : 'N/A'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}
