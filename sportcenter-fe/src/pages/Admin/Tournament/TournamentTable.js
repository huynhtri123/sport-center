import styles from '../../../assets/css/Admin/manageTournaments.module.scss';
import ConfirmModal from '../../../components/Modal/ConfirmModal';
import { formatDate } from '../../../utils/DateTimeConverter';

function TournamentTable({
    filteredTournaments,
    currentPage,
    pageSize,
    handleEditClick,
    toggleModalOpen,
    isModalOpen,
    deleteTournamentId,
    handleSoftDelete,
}) {
    return (
        <table className={`mt-4 ${styles.tournamentsTable}`}>
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên Giải đấu</th>
                    <th>Môn Thể Thao</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th>Số đội tối đa</th>
                    <th>Hạn đăng ký</th>
                    <th>Ảnh</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {filteredTournaments.length > 0 ? (
                    filteredTournaments.map((tournament, index) => (
                        <tr key={tournament.id}>
                            <td>{index + 1 + currentPage * pageSize}</td>
                            <td>{tournament.tournamentName}</td>
                            <td>{tournament.sport.id}</td>
                            <td>
                                {formatDate(tournament.startDate)} {', '}
                                {new Date(tournament.startDate).toLocaleTimeString()}
                            </td>
                            <td>
                                {formatDate(tournament.endDate)} {', '}
                                {new Date(tournament.endDate).toLocaleTimeString()}
                            </td>
                            <td>{tournament.maxTeams}</td>
                            <td>
                                {formatDate(tournament.registrationDeadline)} {', '}
                                {new Date(tournament.registrationDeadline).toLocaleTimeString()}
                            </td>
                            <td>
                                <img
                                    src={tournament.thumUrl}
                                    alt={tournament.tournamentName}
                                    className={styles.tournamentImage}
                                />
                            </td>
                            <td>
                                <div className={styles.actionButtons}>
                                    <button
                                        className={`btn ${styles.editButton}`}
                                        onClick={() => handleEditClick(tournament)}
                                    >
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        className={`btn ${styles.deleteButton}`}
                                        onClick={() => toggleModalOpen(tournament.id)}
                                    >
                                        Xóa
                                    </button>
                                    {isModalOpen && deleteTournamentId === tournament.id && (
                                        <ConfirmModal
                                            title='Bạn có chắc chắn muốn xóa giải đấu này không?'
                                            isOpen={isModalOpen}
                                            onClose={() => toggleModalOpen(null)}
                                            onSubmit={handleSoftDelete}
                                        />
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan='9'>Không có giải đấu nào.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}

export default TournamentTable;
