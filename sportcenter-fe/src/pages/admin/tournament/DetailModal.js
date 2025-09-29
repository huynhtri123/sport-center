import clsx from 'clsx';
import styles from './detailTournament.module.scss';

function DetailModal({ isOpen, onClose, title, registeredTeams }) {
    // Nếu modal không mở, trả về null
    if (!isOpen) return null;

    return (
        <div className={clsx(styles.modalOverlay)}>
            <div className={clsx(styles.modalContent)}>
                <h4>{title}</h4>

                {registeredTeams && registeredTeams.length > 0 ? (
                    <ul className={clsx(styles.teamList)}>
                        {registeredTeams.map((team, index) => (
                            <li key={index}>
                                <div className={clsx(styles.teamInfo)}>
                                    <div className={clsx(styles.teamDetails)}>
                                        <strong className={clsx(styles.teamName)}>{team.teamName}</strong>

                                        {team.players && (
                                            <div>
                                                <strong>Players: </strong>
                                                {team.players.map((player, idx) => (
                                                    <span key={idx}>
                                                        {player.name}
                                                        {idx < team.players.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {team.teamLogoUrl && (
                                        <div className={clsx(styles.teamLogo)}>
                                            <img src={team.teamLogoUrl} alt={team.teamName} width='80' height='80' />
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className='font-size-16px' style={{ color: '#ff9966' }}>
                        No teams have registered yet.
                    </p>
                )}

                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default DetailModal;
