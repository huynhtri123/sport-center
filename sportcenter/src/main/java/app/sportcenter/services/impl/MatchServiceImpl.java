package app.sportcenter.services.impl;

import app.sportcenter.commons.MatchStatus;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.request.MatchRequest;
import app.sportcenter.models.dto.request.MatchResultRequest;
import app.sportcenter.models.dto.request.MatchesRequest;
import app.sportcenter.models.dto.response.MatchResponse;
import app.sportcenter.models.dto.response.TeamResponse;
import app.sportcenter.models.dto.response.TournamentResponse;
import app.sportcenter.models.entities.*;
import app.sportcenter.repositories.MatchRepository;
import app.sportcenter.repositories.TeamRepository;
import app.sportcenter.repositories.TournamentRepository;
import app.sportcenter.services.MatchService;
import app.sportcenter.services.TeamService;
import app.sportcenter.services.TournamentService;
import app.sportcenter.utils.mappers.MatchMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final MatchMapper mapper;
    private final TournamentService tournamentService;
    private final TeamService teamService;
    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;

    @Override
    public MatchResponse createMatch(MatchRequest matchRequest) {
        TournamentResponse tournament = tournamentService.getById(matchRequest.getTournamentId());
        TeamResponse teamA = teamService.getById(matchRequest.getTeamAId());
        TeamResponse teamB = teamService.getById(matchRequest.getTeamBId());
        if (tournament == null || teamA == null || teamB == null) {
            throw new CustomException("Match request not valid!", 400);
        }

        Match match = mapper.convertToEntity(matchRequest);
        if (matchRequest.getRound() == null) {
            match.setRound(1);
        }

        return mapper.convertToResponse(matchRepository.save(match));
    }

    @Override
    public void createMatches(MatchesRequest matchesRequest) {
        Tournament tournament = tournamentRepository.findById(matchesRequest.getTournamentId()).orElseThrow(
                () -> new CustomException("Tournament cannot found!", 400)
        );

        log.info(matchesRequest.getFirstStartTime().toString());
        log.info(matchesRequest.getFirstEndTime().toString());

        // check input
        if (!matchesRequest.getFirstEndTime().isAfter(matchesRequest.getFirstStartTime())) {
            throw new CustomException("End time must be after start time", 400);
        }
        if (matchesRequest.getGapBetweenMatches() < 1) {
            throw new CustomException("Gap between matches must be greater than 1!", 400);
        }

        // check và lấy danh sách đội
        List<String> registeredTeams = tournament.getRegisteredTeamIds();
        if (registeredTeams == null || registeredTeams.size() < 2) {
            throw new CustomException("There aren't enough teams to create matchups.", 400);
        }
        List<String> teamIds = tournament.getAdvancingTeams();
        // lấy danh sách đội đi tiếp, nếu ko có thì đây là vòng 1 -> lấy tất cả đội tham gia
        if (teamIds == null || teamIds.isEmpty()) {
            teamIds = new ArrayList<>(registeredTeams);
        }
        if (teamIds.size() < 2) {
            throw new CustomException("There aren't enough teams to create matchups.", 400);
        }

        ZonedDateTime now = ZonedDateTime.now();
        // check thời gian bắt đầu giải đấu
        if (now.isBefore(tournament.getStartDate())) {
            throw new CustomException("The tournament start time hasn't arrived yet.", 400);
        }

        // check hạn đăng ký hết chưa
        if (now.isBefore(tournament.getRegistrationDeadline())) {
            throw new CustomException("Registration is still open.", 400);
        }

        // trộn ngẫu nhiên
        Collections.shuffle(teamIds);

        ZonedDateTime currentStart = matchesRequest.getFirstStartTime();
        ZonedDateTime currentEnd = matchesRequest.getFirstEndTime();
        Duration matchDuration = Duration.between(matchesRequest.getFirstStartTime(), matchesRequest.getFirstEndTime());
        long minutes = matchDuration.toMinutes();

        // xác định vòng đấu hiện tại
        Match lastMatch = matchRepository.findFirstByTournamentIdOrderByRoundDesc(matchesRequest.getTournamentId());
        int nextRound = lastMatch != null ? lastMatch.getRound() + 1 : 1;

        // check các vòng trước đã đấu xong hết chưa
        boolean hasPendingMatches = matchRepository.existsByTournamentIdAndRoundAndStatus(
                matchesRequest.getTournamentId(), nextRound - 1, MatchStatus.ONGOING);
        if (hasPendingMatches) {
            throw new CustomException("The previous round hasn't finished yet.!", 400);
        }

        // tạo cặp đấu (trận đấu) ngẫu nhiên
        for (int i = 0; i < teamIds.size() - 1; i += 2) {
            String teamAId = teamIds.get(i);
            String teamBId = teamIds.get(i + 1);

            MatchRequest matchRequest = new MatchRequest();
            matchRequest.setRound(nextRound);
            matchRequest.setTournamentId(matchesRequest.getTournamentId());
            matchRequest.setTeamAId(teamAId);
            matchRequest.setTeamBId(teamBId);
            matchRequest.setStartTime(currentStart);
            matchRequest.setEndTime(currentEnd);
            matchRequest.setStatus(MatchStatus.ONGOING);

            createMatch(matchRequest);

            // them bang xep hang cho team vào tournament
            StandingsEntry srA = tournamentService.findOrCreateStanding(tournament, teamAId);
            StandingsEntry srB = tournamentService.findOrCreateStanding(tournament, teamBId);

            currentStart = currentEnd.plusMinutes(matchesRequest.getGapBetweenMatches()); // gap giữa các trận
            currentEnd = currentStart.plusMinutes(minutes);
        }

        // nếu lẻ 1 đội thì cho vào thẳng vòng sau
        if (teamIds.size() % 2 != 0) {
            String byeTeamId = teamIds.get(teamIds.size() - 1);
            System.out.println("Đội được thẳng vào vòng sau: " + byeTeamId);
            if (tournament.getAdvancingTeams() == null) {
                tournament.setAdvancingTeams(new ArrayList<>());
            }
            // tao bxh
            StandingsEntry srC = tournamentService.findOrCreateStanding(tournament, byeTeamId);
            srC.setWon(srC.getWon()+1);
            srC.setPoints(srC.getPoints()+3);
            tournament.getAdvancingTeams().add(byeTeamId);
        }
        tournamentRepository.save(tournament);
    }

    @Override
    public MatchResponse updateResult(MatchResultRequest matchResultRequest) {
        Match match = matchRepository.findById(matchResultRequest.getMatchId())
                .orElseThrow(() -> new NotFoundException("Match cannot found!"));
        Tournament tournament = tournamentRepository.findById(match.getTournamentId())
                .orElseThrow(() -> new NotFoundException("Tournament cannot found!"));
        if (matchResultRequest.getScoreA() == matchResultRequest.getScoreB())
            throw new CustomException("Scores cannot be equal together!", 400);
        if (match.getStatus() == MatchStatus.COMPLETED) {
            throw new CustomException("The match result has already been updated!", 400);
        }

        if (tournament.getAdvancingTeams() == null) {
            tournament.setAdvancingTeams(new ArrayList<>());
        }

        // 1. cập nhật Match
        match.setStatus(MatchStatus.COMPLETED);
        match.setScoreA(matchResultRequest.getScoreA());
        match.setScoreB(matchResultRequest.getScoreB());

        // 2. cập nhật StandingsEntry
        StandingsEntry srA = tournamentService.findOrCreateStanding(tournament, match.getTeamAId());
        StandingsEntry srB = tournamentService.findOrCreateStanding(tournament, match.getTeamBId());
        srA.setPlayed(srA.getPlayed()+1);
        srB.setPlayed(srB.getPlayed()+1);
        if (matchResultRequest.getScoreA() > matchResultRequest.getScoreB()) {
            // A win
            srA.setWon(srA.getWon()+1);
            srB.setLost(srB.getLost()+1);
            srA.setPoints(srA.getPoints()+3);
            match.setWinnerId(match.getTeamAId());
            // A vao vong tiep theo
            if (!tournament.getAdvancingTeams().contains(match.getTeamAId())) {
                tournament.getAdvancingTeams().add(match.getTeamAId());
            }
            // B bi loai
            tournament.getAdvancingTeams().remove(match.getTeamBId());
        } else {
            // B win
            srB.setWon(srB.getWon()+1);
            srA.setLost(srA.getLost()+1);
            srB.setPoints(srB.getPoints()+3);
            match.setWinnerId(match.getTeamBId());
            // B vao vong tiep theo
            if (!tournament.getAdvancingTeams().contains(match.getTeamBId())) {
                tournament.getAdvancingTeams().add(match.getTeamBId());
            }
            // A bi loai
            tournament.getAdvancingTeams().remove(match.getTeamAId());
        }
        srA.setGoalsFor(match.getScoreA());
        srA.setGoalsAgainst(match.getScoreB());
        srB.setGoalsFor(match.getScoreB());
        srB.setGoalsAgainst(match.getScoreA());

        // 3. cập nhật Tournament
        tournamentRepository.save(tournament);
        matchRepository.save(match);

        return mapper.convertToResponse(match);
    }

    @Override
    public List<MatchResponse> getAllActive() {
        return matchRepository.findByIsActiveTrueAndIsDeletedFalse()
                .stream()
                .map(mapper::convertToResponse)
                .toList();
    }

    @Override
    public MatchResponse getById(String matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new NotFoundException("Match cannot found!"));
        return mapper.convertToResponse(match);
    }

    @Override
    public List<MatchResponse> getByTournament(String tournamentId) {
        return matchRepository.findByTournamentId(tournamentId)
                .stream()
                .map(mapper::convertToResponse)
                .toList();
    }

    @Override
    public List<TeamResponse> award(String tournamentId) {
        // điểu kiện: nếu advancings còn 1 và không có trận đấu nào chưa hoàn thành
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new NotFoundException("Tournament cannot found!"));

        // check xem giai dau do da xong chua
        if (tournament.isDone()) {
            throw new CustomException("This tournament is done!", 400);
        }

        // check xem doi di tiep chi con 1 khong
        List<String> advancings = tournament.getAdvancingTeams();
        if (advancings == null || advancings.size() != 1) {
            throw new CustomException("The advancings list must contain exactly 1 team to determine the winner!", 400);
        }

        // check xem con tran dau nao chua hoan thanh khong
        List<Match> matches = matchRepository.findByTournamentId(tournamentId);
        boolean isNotCompleted = matches.stream().anyMatch(m -> !m.getStatus().equals(MatchStatus.COMPLETED));
        if (isNotCompleted) {
            throw new CustomException("There is at least 1 match that is not completed!", 400);
        }

        // ok, du dieu kien
        // sắp xếp StandingsEntry dựa trên tiêu chí: points -> won -> hiệu số bàn thắng
        List<StandingsEntry> sortedStandings = tournament.getStandings().stream()
                .sorted(Comparator.comparingInt(StandingsEntry::getPoints)
                        .thenComparingInt(StandingsEntry::getWon)
                        .thenComparingInt(entry -> entry.getGoalsFor() - entry.getGoalsAgainst())
                        .reversed())  // sắp xếp theo thứ tự giảm dần
                .toList();
        // lấy số lượng giải thưởng (n giải)
        int numPrizes = tournament.getPrizes().size();
        // lấy số đội cần trao giải, nếu số đội ít hơn số giải thì chỉ lấy đủ số đội
        int teamsToAward = Math.min(sortedStandings.size(), numPrizes);

        List<WinnerEntry> winners = new ArrayList<>();
        List<TeamResponse> teamResponses = new ArrayList<>();
        for (int i = 0; i < teamsToAward; i++) {
            StandingsEntry entry = sortedStandings.get(i);
            Prize prize = tournament.getPrizes().get(i); // giải thưởng tương ứng với vị trí

            // trao giai
            TeamResponse teamResponse = teamService.award(entry.getTeamId(), tournamentId, prize);
            teamResponses.add(teamResponse);

            winners.add(new WinnerEntry(entry.getTeamId(), prize.getPosition()));
        }

        tournament.setWinners(winners);
        tournament.setDone(true);   // trao giải xong thì set isDone để trang home bỏ nó ra
        tournamentRepository.save(tournament);

        return teamResponses;
    }

}
