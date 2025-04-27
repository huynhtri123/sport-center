package app.sportcenter.services;

import app.sportcenter.models.dto.request.MatchRequest;
import app.sportcenter.models.dto.request.MatchResultRequest;
import app.sportcenter.models.dto.request.MatchesRequest;
import app.sportcenter.models.dto.response.MatchResponse;
import app.sportcenter.models.dto.response.TeamResponse;

import java.util.List;

public interface MatchService {

    // tạo 1 trận đấu
    public MatchResponse createMatch(MatchRequest matchRequest);

    // chia cặp đấu (tạo nhiều trận đấu)
    // khi admin bấm start giải đấu, hàm này thực hiện chia cặp đấu cho vòng 1
    public void createMatches(MatchesRequest matchesRequest);

    public MatchResponse updateResult(MatchResultRequest matchResultRequest);

    public List<MatchResponse> getAllActive();
    public MatchResponse getById(String matchId);
    public List<MatchResponse> getByTournament(String tournamentId);

    public TeamResponse award(String tournamentId);
}
