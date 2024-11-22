package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.PaginatedResponse;
import app.sportcenter.commons.Role;
import app.sportcenter.configs.AppConfig;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.*;
import app.sportcenter.models.entities.Team;
import app.sportcenter.models.entities.Tournament;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.SportRepository;
import app.sportcenter.repositories.TeamRepository;
import app.sportcenter.repositories.TournamentRepository;
import app.sportcenter.repositories.UserRepository;
import app.sportcenter.services.MailService;
import app.sportcenter.services.TournamentService;
import app.sportcenter.utils.mappers.TeamMapper;
import app.sportcenter.utils.mappers.TournamentMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TournamentServiceImpl implements TournamentService {
    @Autowired
    private TournamentRepository tournamentRepository;
    @Autowired
    private TournamentMapper tournamentMapper;
    @Autowired
    private SportRepository sportRepository;
    @Autowired
    private TeamRepository teamRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MailService mailService;
    @Autowired
    private AppConfig appConfig;
    @Autowired
    private TeamMapper teamMapper;

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> create(TournamentRequest tournamentRequest) {
        if (tournamentRequest.getThumUrl() == null || tournamentRequest.getThumUrl().isEmpty()) {
            tournamentRequest.setThumUrl(appConfig.getDefaultIcon());
        }
        Tournament tournament = tournamentMapper.convertToEntity(tournamentRequest);
        if (tournament == null) {
            throw new CustomException("Inputs are null!", HttpStatus.BAD_REQUEST.value());
        }

        boolean isExistedSport = sportRepository.existsById(tournamentRequest.getSportId());
        if (!isExistedSport) {
            throw new NotFoundException("Sport không tồn tại");
        }

        Tournament savedTournament = tournamentRepository.save(tournament);
        TournamentResponse tournamentResponse = tournamentMapper.convertToDTO(
                savedTournament
        );
        return ResponseEntity.ok(
                new BaseResponse("Tạo mới Tournament thành công.", HttpStatus.OK.value(), tournamentResponse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAllActive(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Tournament> activeTournamentsPage = tournamentRepository.findAllActive(pageable);

        if (activeTournamentsPage.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy Tournament nào đang hoạt động", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        List<TournamentResponse> response = activeTournamentsPage.getContent()
                .stream()
                .map(tournamentMapper::convertToDTO)
                .collect(Collectors.toList());

        // Create a PaginatedResponse object
        PaginatedResponse<TournamentResponse> paginatedResponse = new PaginatedResponse<>(
                response,
                activeTournamentsPage.getTotalPages(),
                activeTournamentsPage.getTotalElements()
        );

        // Return the BaseResponse with paginated data
        return ResponseEntity.ok(
                new BaseResponse(
                        "Tìm thấy danh sách Tournament đang hoạt động",
                        HttpStatus.OK.value(),
                        paginatedResponse
                )
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getById(String id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy Tournament có id này"));
        TournamentResponse response = tournamentMapper.convertToDTO(tournament);
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy Tournament", HttpStatus.OK.value(), response)
        );
    }

    public ResponseEntity<BaseResponse> getBySportId(String sportId) {
        List<Tournament> tournaments = tournamentRepository.getBySportId(sportId);
        if (tournaments.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy Tournament nào cho sport này", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        List<TournamentResponse> response = tournaments.stream().map(tournamentMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách Tournament cho sport này", HttpStatus.OK.value(), response)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getRegistedTeams(String tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy Tournament này!"));
        List<String> listTeamId = tournament.getRegisteredTeamIds();
        if (listTeamId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Không tìm thấy đội nào tham gia", HttpStatus.OK.value(), null)
            );
        }
        List<Team> teams = listTeamId.stream()
                .map(id -> teamRepository.findById(id)
                        .orElseThrow(() -> new NotFoundException("Không tìm thấy Team")))
                .toList();
        List<TeamResponse> teamsResponse = teams.stream().map(teamMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách đội tham gia giải đấu", HttpStatus.OK.value(), teamsResponse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> myRegistered() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Không tìm thấy thông tin đăng nhập!", HttpStatus.BAD_REQUEST.value());
        }
        String userId = currentUser.getId();

        // Bước 1: Tìm tất cả các đội của người dùng
        List<Team> userTeams = teamRepository.getTeamByUserIdAndIsActiveTrueAndIsDeletedFalse(userId);
        if (userTeams.isEmpty()) {
            throw new NotFoundException("Không tìm thấy đội nào của người dùng!");
        }

        // Bước 2: Lấy danh sách ID của các đội
        List<String> teamIds = userTeams.stream().map(Team::getId).collect(Collectors.toList());

        // Bước 3: Tìm tất cả các giải đấu mà có các đội của người dùng đã đăng ký
        List<Tournament> tournaments = tournamentRepository.findByRegisteredTeamIds(teamIds);
        if (tournaments.isEmpty()) {
            throw new NotFoundException("Không tìm thấy giải đấu nào mà các đội của người dùng đã đăng ký!");
        }

        List<TournamentResponse> responses = tournaments.stream().map(tournamentMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách giải đấu mà người dùng tham gia", HttpStatus.OK.value(), responses)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getMyRegisteredTeamInTournament(String tournamentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof User currentUser)) {
            throw new NotFoundException("Không tìm thấy người dùng đang đăng nhập");
        }

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy Tournament"));

        Optional<Team> userTeam = tournament.getRegisteredTeamIds()
                .stream().map(teamRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .filter(team -> team.getUserId().equals(currentUser.getId()))
                .findFirst();
        if (userTeam.isPresent()) {
            TeamResponse response = teamMapper.convertToDTO(userTeam.get());
            return ResponseEntity.ok(
                    new BaseResponse("Tìm thấy Team của người dùng hiện tại trong giải đấu này",
                            HttpStatus.OK.value(), response)
            );
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new BaseResponse("Không tìm thấy Team của người dùng hiện tại trong Tournament này!",
                        HttpStatus.NOT_FOUND.value(), null)
        );
    }


    @Transactional
    @Override
    public ResponseEntity<BaseResponse> updateById(String id, TournamentRequest tournamentRequest) {
        Tournament existingTournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy Tournament với ID này"));

        boolean isExistedSport = sportRepository.existsById(tournamentRequest.getSportId());
        if (!isExistedSport) {
            throw new NotFoundException("Sport không tồn tại");
        }

        existingTournament.setSportId(tournamentRequest.getSportId());
        existingTournament.setTournamentName(tournamentRequest.getTournamentName());
        existingTournament.setStartDate(tournamentRequest.getStartDate());
        existingTournament.setEndDate(tournamentRequest.getEndDate());
        existingTournament.setMaxTeams(tournamentRequest.getMaxTeams());
        existingTournament.setRegisteredTeamIds(tournamentRequest.getRegisteredTeamIds());
        existingTournament.setRegistrationDeadline(tournamentRequest.getRegistrationDeadline());
        existingTournament.setPrizes(tournamentRequest.getPrizes());
        existingTournament.setThumUrl(tournamentRequest.getThumUrl());

        Tournament updatedTournament = tournamentRepository.save(existingTournament);

        TournamentResponse tournamentResponse = tournamentMapper.convertToDTO(updatedTournament);
        return ResponseEntity.ok(
                new BaseResponse("Cập nhật Tournament thành công.", HttpStatus.OK.value(), tournamentResponse)
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> toggleDelete(String tournamentId, boolean flag) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tournament"));
        tournament.setIsDeleted(flag);
        Tournament updatedTournament = tournamentRepository.save(tournament);

        TournamentResponse response = tournamentMapper.convertToDTO(updatedTournament);
        String message = flag ? "Xoá mềm Tournament thành công" : "Khôi phục Tournament thành công";
        return ResponseEntity.ok(
                new BaseResponse(message, HttpStatus.OK.value(), response)
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> forceDelete(String tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tournament"));
        tournamentRepository.deleteById(tournamentId);
        TournamentResponse response = tournamentMapper.convertToDTO(tournament);
        return ResponseEntity.ok(
                new BaseResponse("Xoá cứng Tournament thành công.", HttpStatus.OK.value(), response)
        );
    }

    // for customer:
    @Transactional
    @Override
    public ResponseEntity<BaseResponse> register(TournamentRegisterRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        if (currentUser == null) {
            throw new CustomException("Không tìm thấy thông tin đăng nhập!", HttpStatus.BAD_REQUEST.value());
        }

        // Kiểm tra điều kiện đăng ký
        checkRegistrationEligibility(request.getTournamentId(), request.getTeamId(), currentUser);

        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy giải đấu với ID này"));

        tournament.getRegisteredTeamIds().add(request.getTeamId());
        TournamentResponse response = tournamentMapper.convertToDTO(tournamentRepository.save(tournament));

        // Gửi email thông báo
        Team team = teamRepository.findById(request.getTeamId()).orElseThrow(
                () -> new NotFoundException("Không tìm thấy Team để gửi mail")
        );
        sendRegistrationEmail(tournament, team);

        return ResponseEntity.ok(new BaseResponse(
                "Đăng ký tham gia giải đấu thành công.", HttpStatus.OK.value(), response)
        );
    }

    @Override
    public void checkRegistrationEligibility(String tournamentId, String teamId, User currentUser) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy Team này"));

        // 1. kiểm tra người đang đăng nhập có phải chủ sở hữu Team hoặc role admin
        if (!team.getUserId().equals(currentUser.getId()) && !currentUser.getRole().equals(Role.ADMIN)) {
            throw new CustomException("Bạn không phải chủ sở hữu Team này!", HttpStatus.BAD_REQUEST.value());
        }

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy giải đấu với ID này"));

        // 2. kiểm tra thời hạn đăng ký
        if (ZonedDateTime.now().isAfter(tournament.getRegistrationDeadline())) {
            throw new CustomException("Thời hạn đăng ký tham gia giải đấu đã hết", HttpStatus.BAD_REQUEST.value());
        }

        // 3. kiểm tra xem có đội nào của currentUser đã đăng ký cho giải đấu này
        // nếu chưa có đội nào đki -> tạo mới list tránh lỗi
        if (tournament.getRegisteredTeamIds() == null) {
            tournament.setRegisteredTeamIds(new ArrayList<>());
        }
        for (String registeredTeamId : tournament.getRegisteredTeamIds()) {
            Optional<Team> registeredTeam = teamRepository.findById(registeredTeamId);
            if (registeredTeam.isPresent()) {
                if (registeredTeam.get().getUserId().equals(currentUser.getId())) {
                    throw new CustomException("Bạn đã đăng kí tham gia giải này trước đó rồi", HttpStatus.BAD_REQUEST.value());
                }
            }
        }

        // 4. kiểm tra giới hạn số đội đăng ký
        if (tournament.getRegisteredTeamIds().size() >= tournament.getMaxTeams()) {
            throw new CustomException("Số lượng đội tham gia đã đạt giới hạn tối đa!", HttpStatus.BAD_REQUEST.value());
        }

        // 5. kiểm tra xem đội đã đăng ký giải đấu chưa
        if (tournament.getRegisteredTeamIds().contains(teamId)) {
            throw new CustomException("Đội này đã đăng ký tham gia giải đấu trước đó rồi", HttpStatus.BAD_REQUEST.value());
        }
    }

    public void sendRegistrationEmail(Tournament tournament, Team team) {
        User user = userRepository.findById(team.getUserId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người sở hữu team này để lấy email"));
        String toEmail = user.getEmail();
        mailService.sendMailRegisterTournament(
                toEmail,
                tournament.getTournamentName(),
                tournament.getStartDate(),
                tournament.getEndDate(),
                team
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> unregister(TournamentRegisterRequest request) {
        // kiểm tra xem người đang đăng nhập có khớp với chủ sở hữu Team không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Không tìm thấy thông tin đăng nhập!", HttpStatus.BAD_REQUEST.value());
        }
        String currentUserId = currentUser.getId();

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy Team này"));

        // chỉ có chủ sở hữu Team hoặc admin mới có thể hủy đăng ký
        if (team.getUserId().equals(currentUserId) || currentUser.getRole().equals(Role.ADMIN)) {
            Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy giải đấu với ID này"));

            // kiểm tra xem đội có trong danh sách đã đăng ký không
            if (tournament.getRegisteredTeamIds() == null ||
                    !tournament.getRegisteredTeamIds().contains(request.getTeamId())) {
                throw new CustomException("Đội này chưa đăng ký tham gia giải đấu", HttpStatus.BAD_REQUEST.value());
            }

            // xóa đội khỏi danh sách đăng ký
            tournament.getRegisteredTeamIds().remove(request.getTeamId());

            TournamentResponse response = tournamentMapper.convertToDTO(tournamentRepository.save(tournament));

            // gửi mail thông báo
            User user = userRepository.findById(team.getUserId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy người sở hữu team này để lấy email"));
            String toEmail = user.getEmail();
            mailService.sendMailUnregisterTournament(toEmail, tournament.getTournamentName(), tournament.getStartDate(), tournament.getEndDate(), team);

            return ResponseEntity.ok(new BaseResponse(
                    "Hủy đăng ký tham gia giải đấu thành công.", HttpStatus.OK.value(), response)
            );

        } else {
            throw new CustomException("Bạn không phải chủ sở hữu Team này!", HttpStatus.BAD_REQUEST.value());
        }
    }

}
