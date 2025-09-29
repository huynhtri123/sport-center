import React from 'react';
import styles from './rulePrizeSection.module.scss';
import formatCurrency from '../../../utils/formatCurrency';

export default function RulePrizeSection({ tournament }) {
    return (
        <>
            <div className={styles.details}>
                <h3 className={styles.rulePrizeSectionTitle}>{tournament.tournamentName}</h3>
                <p>
                    <strong>Sport:</strong> {tournament.sport?.sportName}
                </p>
                <p>
                    <strong>Start Date:</strong> {new Date(tournament.startDate).toLocaleString()}
                </p>
                <p>
                    <strong>Registration Deadline:</strong> {new Date(tournament.registrationDeadline).toLocaleString()}
                </p>
                <p>
                    <strong>Max Teams:</strong> {tournament.maxTeams}
                </p>
                <p>
                    <strong>Registration Fee:</strong> {formatCurrency(tournament.registrationFee)}
                </p>
            </div>
            <div className={styles.rules}>
                <h2 className={styles.rulePrizeSectionTitle}>Rules</h2>
                <ul>
                    {tournament.rules.map((rule, index) => (
                        <li key={index}>{rule}</li>
                    ))}
                </ul>
            </div>
            <div className={styles.prizes}>
                <h2 className={styles.rulePrizeSectionTitle}>Prizes</h2>
                {tournament.prizes.length > 0 ? (
                    <ul>
                        {tournament.prizes.map((prize, index) => (
                            <li key={index} className={styles.prizeItem}>
                                <i className='fas fa-award' /> {/* Font Awesome icon */}
                                <span className={styles.prizePosition}>{prize.position}</span>
                                <span className={styles.prizeDescription}>{prize.description}</span>
                                <span className={styles.prizeReward}>{formatCurrency(prize.reward)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No prizes available</p>
                )}
            </div>
        </>
    );
}
