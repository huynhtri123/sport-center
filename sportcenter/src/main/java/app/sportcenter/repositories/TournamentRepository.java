package app.sportcenter.repositories;

import app.sportcenter.models.entities.Tournament;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface TournamentRepository extends MongoRepository<Tournament, String> {
    public List<Tournament> getTournamentByIsActiveTrueAndIsDeletedFalse();
    boolean existsBySportIdAndIsActiveTrueAndIsDeletedFalse(String sportId);

    @Query("{ 'sportId': ?0, 'isDeleted': false, 'isActive': true }")
    public List<Tournament> getBySportId(String sportId);

    // tìm các giải đấu mà một đội tham gia
    @Query("{ 'registeredTeamIds': { $in: [?0] }, 'isDeleted': false, 'isActive': true }")
    List<Tournament> findByRegisteredTeamId(String teamId);

    @Query("{ 'isDeleted': false, 'isActive': true }")
    Page<Tournament> findAllActive(Pageable pageable);
    @Query("{ 'registeredTeamIds': { $in: ?0 }, 'isDeleted': false, 'isActive': true }")
    List<Tournament> findByRegisteredTeamIds(List<String> teamIds);

}
