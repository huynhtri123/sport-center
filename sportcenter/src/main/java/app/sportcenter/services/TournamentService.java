package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.TournamentRegisterRequest;
import app.sportcenter.models.dto.TournamentRequest;
import app.sportcenter.models.entities.User;
import org.springframework.http.ResponseEntity;

public interface TournamentService {
    public ResponseEntity<BaseResponse> create(TournamentRequest tournamentRequest);

    public ResponseEntity<BaseResponse> getAllActive(int page, int size);

    public ResponseEntity<BaseResponse> getById(String id);

    public ResponseEntity<BaseResponse> getBySportId(String sportId);

    public ResponseEntity<BaseResponse> getRegistedTeams(String tournamentId);

    public ResponseEntity<BaseResponse> myRegistered();
    // lấy Team trong Tournament
    public ResponseEntity<BaseResponse> getMyRegisteredTeamInTournament(String tournamentId);

    public ResponseEntity<BaseResponse> updateById(String id, TournamentRequest tournamentRequest);

    public ResponseEntity<BaseResponse> toggleDelete(String tournamentId, boolean flag);

    public ResponseEntity<BaseResponse> forceDelete(String tournamentId);

    // for customer
    public ResponseEntity<BaseResponse> register(TournamentRegisterRequest request);

    public ResponseEntity<BaseResponse> unregister(TournamentRegisterRequest request);

    public void checkRegistrationEligibility(String tournamentId, String teamId, User currentUser);

    public ResponseEntity<BaseResponse> searchByNameAndPaginate(String tournamentName, int page, int size);
}
