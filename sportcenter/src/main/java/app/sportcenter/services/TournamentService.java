package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.request.TournamentRegisterRequest;
import app.sportcenter.models.dto.request.TournamentRequest;
import app.sportcenter.models.dto.request.UnregisterTournamentRequest;
import app.sportcenter.models.dto.response.RegisterOrderResponse;
import app.sportcenter.models.dto.response.TeamResponse;
import app.sportcenter.models.dto.response.TournamentResponse;
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

    public RegisterOrderResponse register(TournamentRegisterRequest request);

    public ResponseEntity<BaseResponse> unregister(UnregisterTournamentRequest request);

    public TeamResponse updateTeam(TournamentRegisterRequest request, String teamId);

    public void checkRegistrationEligibility(String tournamentId, User currentUser);

    public ResponseEntity<BaseResponse> searchByNameAndPaginate(String tournamentName, int page, int size);

    public TournamentResponse confirmRegister(String registerOrderId);
}
