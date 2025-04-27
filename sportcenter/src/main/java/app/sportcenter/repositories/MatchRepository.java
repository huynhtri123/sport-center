package app.sportcenter.repositories;

import app.sportcenter.commons.MatchStatus;
import app.sportcenter.models.entities.Match;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface MatchRepository extends MongoRepository<Match, String> {
    Match findFirstByTournamentIdOrderByRoundDesc(String tournamentId); // tìm vòng đấu mới nhất

    boolean existsByTournamentIdAndRoundAndStatus(String tournamentId, int round, MatchStatus status);

    List<Match> findByIsActiveTrueAndIsDeletedFalse();

    List<Match> findByTournamentId(String tournamentId);
}
