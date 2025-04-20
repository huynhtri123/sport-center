package app.sportcenter.services.impl;

import app.sportcenter.commons.*;
import app.sportcenter.configs.AppConfig;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.request.TournamentRegisterRequest;
import app.sportcenter.models.dto.request.TournamentRequest;
import app.sportcenter.models.dto.request.UnregisterTournamentRequest;
import app.sportcenter.models.dto.response.RegisterOrderResponse;
import app.sportcenter.models.dto.response.TeamResponse;
import app.sportcenter.models.dto.response.TournamentResponse;
import app.sportcenter.models.entities.RegisterOrder;
import app.sportcenter.models.entities.Team;
import app.sportcenter.models.entities.Tournament;
import app.sportcenter.repositories.*;
import app.sportcenter.services.MailService;
import app.sportcenter.services.TeamService;
import app.sportcenter.utils.kafkaUsage.MessageWrapper;
import app.sportcenter.utils.kafkaUsage.TournamentTeamPayload;
import app.sportcenter.models.entities.User;
import app.sportcenter.services.TournamentService;
import app.sportcenter.utils.mappers.RegisterOrderMapper;
import app.sportcenter.utils.mappers.TeamMapper;
import app.sportcenter.utils.mappers.TournamentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TournamentServiceImpl implements TournamentService {
    private final TournamentRepository tournamentRepository;
    private final TournamentMapper tournamentMapper;
    private final SportRepository sportRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final AppConfig appConfig;
    private final TeamMapper teamMapper;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final TeamService teamService;
    private final RegisterOrderRepository registerOrderRepository;
    private final RegisterOrderMapper registerOrderMapper;
    private final MailService mailService;

    private void checkFutureDate(ZonedDateTime startDate, ZonedDateTime endDate, ZonedDateTime deadlineDate) {
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("UTC"));
        // 1. các ngày trong input phải là trong tương lai
        if (startDate.isBefore(now) || startDate.isEqual(now)) {
            throw new CustomException("The start date must be a future date", HttpStatus.BAD_REQUEST.value());
        }
        if (endDate.isBefore(now) || endDate.isEqual(now)) {
            throw new CustomException("The end date must be a future date", HttpStatus.BAD_REQUEST.value());
        }
        if (deadlineDate.isBefore(now) || deadlineDate.isEqual(now)) {
            throw new CustomException("The registration deadline must be a future date", HttpStatus.BAD_REQUEST.value());
        }
        // 2. ngày kết thúc phải sau ngày bắt đầu
        if (endDate.isBefore(startDate) || endDate.isEqual(startDate)) {
            throw new CustomException("The end date must be after the start date", HttpStatus.BAD_REQUEST.value());
        }

        // 3. ngày deadline phải trước ngày bắt đầu
        if (deadlineDate.isAfter(startDate) || deadlineDate.isEqual(startDate)) {
            throw new CustomException("The registration deadline must be before the start date", HttpStatus.BAD_REQUEST.value());
        }
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> create(TournamentRequest tournamentRequest) {
        // check date input
        checkFutureDate(tournamentRequest.getStartDate(), tournamentRequest.getEndDate(), tournamentRequest.getRegistrationDeadline());

        if (tournamentRequest.getThumUrl() == null || tournamentRequest.getThumUrl().isEmpty()) {
            tournamentRequest.setThumUrl(appConfig.getDefaultIcon());
        }
        Tournament tournament = tournamentMapper.convertToEntity(tournamentRequest);
        if (tournament == null) {
            throw new CustomException("Inputs are null!", HttpStatus.BAD_REQUEST.value());
        }

        boolean isExistedSport = sportRepository.existsById(tournamentRequest.getSportId());
        if (!isExistedSport) {
            throw new NotFoundException("Sport does not exist");
        }

        Tournament savedTournament = tournamentRepository.save(tournament);
        TournamentResponse tournamentResponse = tournamentMapper.convertToDTO(
                savedTournament
        );
        return ResponseEntity.ok(
                new BaseResponse("Successfully created a new Tournament.", HttpStatus.OK.value(), tournamentResponse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAllActive(int page, int size) {
        //Pageable pageable = PageRequest.of(page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Tournament> activeTournamentsPage = tournamentRepository.findAllActive(pageable);

        if (activeTournamentsPage.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("No active tournaments found.", HttpStatus.NOT_FOUND.value(), null)
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
                        "Active tournaments list found.",
                        HttpStatus.OK.value(),
                        paginatedResponse
                )
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getById(String id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tournament with this ID not found."));
        TournamentResponse response = tournamentMapper.convertToDTO(tournament);
        return ResponseEntity.ok(
                new BaseResponse("Tournament found.", HttpStatus.OK.value(), response)
        );
    }

    public ResponseEntity<BaseResponse> getBySportId(String sportId) {
        List<Tournament> tournaments = tournamentRepository.getBySportId(sportId);
        if (tournaments.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("No tournaments found for this sport.", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        List<TournamentResponse> response = tournaments.stream().map(tournamentMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Found a list of tournaments for this sport.", HttpStatus.OK.value(), response)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getRegistedTeams(String tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new NotFoundException("Tournament not found!"));
        List<String> listTeamId = tournament.getRegisteredTeamIds();
        if (listTeamId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("No teams found participating.", HttpStatus.OK.value(), null)
            );
        }
        List<Team> teams = listTeamId.stream()
                .map(teamRepository::getByIdAndIsActiveTrueAndIsDeletedFalse)
                .filter(Objects::nonNull) // Loại bỏ giá trị null
                .toList();

        List<TeamResponse> teamsResponse = teams.stream().map(teamMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Found the list of teams participating in the tournament.", HttpStatus.OK.value(), teamsResponse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> myRegistered() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Login information not found!", HttpStatus.BAD_REQUEST.value());
        }
        String userId = currentUser.getId();

        // Bước 1: Tìm tất cả các đội của người dùng
        List<Team> userTeams = teamRepository.getTeamByUserIdAndIsActiveTrueAndIsDeletedFalse(userId);
        if (userTeams.isEmpty()) {
            throw new NotFoundException("No teams found for the user!");
        }

        // Bước 2: Lấy danh sách ID của các đội
        List<String> teamIds = userTeams.stream().map(Team::getId).collect(Collectors.toList());

        // Bước 3: Tìm tất cả các giải đấu mà có các đội của người dùng đã đăng ký
        List<Tournament> tournaments = tournamentRepository.findByRegisteredTeamIds(teamIds);
        if (tournaments.isEmpty()) {
            throw new NotFoundException("No tournaments found that the user's teams have registered for!");
        }

        List<TournamentResponse> responses = tournaments.stream().map(tournamentMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Found the list of tournaments the user has participated in.", HttpStatus.OK.value(), responses)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getMyRegisteredTeamInTournament(String tournamentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof User currentUser)) {
            throw new NotFoundException("User currently logged in not found.");
        }

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new NotFoundException("Tournament not found."));

        Optional<Team> userTeam = tournament.getRegisteredTeamIds()
                .stream().map(teamRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .filter(team -> team.getUserId().equals(currentUser.getId()))
                .findFirst();
        if (userTeam.isPresent()) {
            TeamResponse response = teamMapper.convertToDTO(userTeam.get());
            return ResponseEntity.ok(
                    new BaseResponse("Found the user's team in this tournament.",
                            HttpStatus.OK.value(), response)
            );
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new BaseResponse("Couldn't find the user's team in this tournament!",
                        HttpStatus.NOT_FOUND.value(), null)
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> updateById(String id, TournamentRequest tournamentRequest) {
        Tournament existingTournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Tournament with this ID not found.y"));

        boolean isExistedSport = sportRepository.existsById(tournamentRequest.getSportId());
        if (!isExistedSport) {
            throw new NotFoundException("Sport does not exist.");
        }

        existingTournament.setSportId(tournamentRequest.getSportId());
        existingTournament.setTournamentName(tournamentRequest.getTournamentName());
        existingTournament.setStartDate(tournamentRequest.getStartDate());
        existingTournament.setEndDate(tournamentRequest.getEndDate());
        existingTournament.setMaxTeams(tournamentRequest.getMaxTeams());
        //existingTournament.setRegisteredTeamIds(tournamentRequest.getRegisteredTeamIds());
        existingTournament.setRegistrationDeadline(tournamentRequest.getRegistrationDeadline());
        existingTournament.setPrizes(tournamentRequest.getPrizes());
        existingTournament.setThumUrl(tournamentRequest.getThumUrl());
        existingTournament.setRegistrationFee(tournamentRequest.getRegistrationFee());
        existingTournament.setRules(tournamentRequest.getRules());

        Tournament updatedTournament = tournamentRepository.save(existingTournament);

        TournamentResponse tournamentResponse = tournamentMapper.convertToDTO(updatedTournament);
        return ResponseEntity.ok(
                new BaseResponse("Tournament updated successfully.", HttpStatus.OK.value(), tournamentResponse)
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> toggleDelete(String tournamentId, boolean flag) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new NotFoundException("Tournament not found."));

        // kiem tra coi co doi nao dang tham gia thi ko cho xoá -> nâng cấp sau
        if (flag) {
            if (!tournament.getRegisteredTeamIds().isEmpty()) {
                throw new CustomException("Cannot soft delete this tournament because there is at least one team currently participating.",
                        HttpStatus.BAD_REQUEST.value());
            }
        }

        tournament.setIsDeleted(flag);
        Tournament updatedTournament = tournamentRepository.save(tournament);

        TournamentResponse response = tournamentMapper.convertToDTO(updatedTournament);
        String message = flag ? "Tournament soft delete successful." : "Tournament restore successful.";
        return ResponseEntity.ok(
                new BaseResponse(message, HttpStatus.OK.value(), response)
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> forceDelete(String tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new NotFoundException("Tournament not found."));
        tournamentRepository.deleteById(tournamentId);
        TournamentResponse response = tournamentMapper.convertToDTO(tournament);
        return ResponseEntity.ok(
                new BaseResponse("Tournament force delete successful.", HttpStatus.OK.value(), response)
        );
    }

    @Transactional
    @Override
    public RegisterOrderResponse register(TournamentRegisterRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        if (currentUser == null) {
            throw new CustomException("Login information not found!", HttpStatus.BAD_REQUEST.value());
        }

        // 1. kiểm tra điều kiện đăng ký
        checkRegistrationEligibility(request.getTournamentId(), currentUser);

        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new NotFoundException("Tournament with this ID not found."));

        // 2. create inactive Team
        TeamResponse team = teamService.temporaryCreate(request.getTeamRequest());

        // 3. update tournament (+1 virtual participant)
        tournament.getRegisteredTeamIds().add(team.getId());
        TournamentResponse response = tournamentMapper.convertToDTO(tournamentRepository.save(tournament));

        // 4. create PENDING Order
        RegisterOrder registerOrder = RegisterOrder.builder()
                .ownerId(currentUser.getId())
                .teamId(team.getId())
                .tournamentId(response.getId())
                .orderStatus(OrderStatus.PENDING)
                .build();
        return registerOrderMapper.convertToResponse(registerOrderRepository.save(registerOrder));
    }

    @Override
    public void checkRegistrationEligibility(String tournamentId, User currentUser) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new NotFoundException("Tournament with this ID not found."));

        // 1. kiểm tra thời hạn đăng ký
        if (ZonedDateTime.now().isAfter(tournament.getRegistrationDeadline())) {
            throw new CustomException("Failed. The registration deadline for the tournament has passed.", HttpStatus.BAD_REQUEST.value());
        }

        // 2. kiểm tra xem có đội nào của currentUser đã đăng ký cho giải đấu này
        if (tournament.getRegisteredTeamIds() == null) {
            tournament.setRegisteredTeamIds(new ArrayList<>());
        }
        for (String registeredTeamId : tournament.getRegisteredTeamIds()) {
            Optional<Team> registeredTeam = teamRepository.findById(registeredTeamId);
            if (registeredTeam.isPresent()) {
                if (registeredTeam.get().getUserId().equals(currentUser.getId())) {
                    throw new CustomException("Failed, you have already registered for this tournament.", HttpStatus.BAD_REQUEST.value());
                }
            }
        }

        // 3. kiểm tra giới hạn số đội đăng ký
        if (tournament.getRegisteredTeamIds().size() >= tournament.getMaxTeams()) {
            throw new CustomException("The number of teams participating has reached the maximum limit!", HttpStatus.BAD_REQUEST.value());
        }

    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> unregister(UnregisterTournamentRequest request) {
        // kiểm tra xem người đang đăng nhập có khớp với chủ sở hữu Team không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Login information not found!", HttpStatus.BAD_REQUEST.value());
        }
        String currentUserId = currentUser.getId();

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new NotFoundException("Team not found"));

        // chỉ có chủ sở hữu Team hoặc admin mới có thể hủy đăng ký
        if (team.getUserId().equals(currentUserId) || currentUser.getRole().equals(Role.ADMIN)) {
            Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                    .orElseThrow(() -> new NotFoundException("Tournament with this ID not found."));

            // kiểm tra xem đội có trong danh sách đã đăng ký không
            if (tournament.getRegisteredTeamIds() == null ||
                    !tournament.getRegisteredTeamIds().contains(request.getTeamId())) {
                throw new CustomException("This team has not registered for the tournament.", HttpStatus.BAD_REQUEST.value());
            }

            // xóa đội khỏi danh sách đăng ký
            tournament.getRegisteredTeamIds().remove(request.getTeamId());

            TournamentResponse response = tournamentMapper.convertToDTO(tournamentRepository.save(tournament));

            User user = userRepository.findById(team.getUserId())
                    .orElseThrow(() -> new NotFoundException("Unable to find the owner of this team to retrieve the email."));
            // gửi mail thông báo
            TeamResponse teamResponse = teamMapper.convertToDTO(team);
            TournamentTeamPayload payload = TournamentTeamPayload.builder()
                    .tournament(response)
                    .team(teamResponse)
                    .build();
            MessageWrapper messageWrapper = MessageWrapper.builder()
                    .type(SendMailType.CANCEL_REGISTER_TOURNAMENT.name())
                    .payload(payload)
                    .toEmail(user.getEmail())
                    .toFullName(user.getFullName())
                    .build();
            //kafkaTemplate.send("unregister-tournament-notification-delivery", messageWrapper);
            mailService.sendMailUnregisterTournament(user.getEmail(), response, teamResponse);

            return ResponseEntity.ok(new BaseResponse(
                    "Successfully canceled registration for the tournament.", HttpStatus.OK.value(), response)
            );

        } else {
            throw new CustomException("You are not the owner of this team!", HttpStatus.BAD_REQUEST.value());
        }
    }

    @Override
    public TeamResponse updateTeam(TournamentRegisterRequest request, String teamId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Login information not found!", HttpStatus.BAD_REQUEST.value());
        }
        String currentUserId = currentUser.getId();

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new NotFoundException("Team not found"));
        // chu so huu hoac ADMIN
        if (team.getUserId().equals(currentUserId) || currentUser.getRole().equals(Role.ADMIN)) {
            Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                    .orElseThrow(() -> new NotFoundException("Tournament with this ID not found."));

            // kiểm tra xem đội có trong danh sách đã đăng ký không
            if (tournament.getRegisteredTeamIds() == null ||
                    !tournament.getRegisteredTeamIds().contains(team.getId())) {
                throw new CustomException("This team has not registered for the tournament.", HttpStatus.BAD_REQUEST.value());
            }

            // ok -> update Team
            return teamService.update(team.getId(), request.getTeamRequest());
        } else {
            throw new CustomException("You dont have permission to update Team of other user!", 403);
        }
    }

    @Override
    public ResponseEntity<BaseResponse> searchByNameAndPaginate(String tournamentName, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Tournament> tournamentPage = tournamentRepository.searchByTournamentNameContainingIgnoreCase(tournamentName, pageable);

        List<TournamentResponse> responseTournaments = tournamentPage.getContent()
                .stream()
                .map(tournamentMapper::convertToDTO)
                .collect(Collectors.toList());

        PaginatedResponse<TournamentResponse> paginatedResponse = new PaginatedResponse<>(
                responseTournaments,
                tournamentPage.getTotalPages(),
                tournamentPage.getTotalElements()
        );

        return ResponseEntity.ok(
                new BaseResponse("Tournament list found.", HttpStatus.OK.value(), paginatedResponse)
        );
    }

    @Override
    public TournamentResponse confirmRegister(String registerOrderId) {
        RegisterOrder registerOrder = registerOrderRepository.findById(registerOrderId)
                .orElseThrow(() -> new NotFoundException("Register request have been expired! Please try again!"));
        Team team = teamRepository.findById(registerOrder.getTeamId())
                .orElseThrow(() -> new NotFoundException("Register request have been expired! Please try again!"));
        Tournament tournament = tournamentRepository.findById(registerOrder.getTournamentId())
                .orElseThrow(() -> new NotFoundException("Register request have been expired! Please try again!"));

        // 1. active Team
        team.setIsActive(true);

        TeamResponse teamResponse = teamMapper.convertToDTO(teamRepository.save(team));
        TournamentResponse tournamentResponse = tournamentMapper.convertToDTO(tournament);

        User owner = userRepository.findById(registerOrder.getOwnerId())
                .orElseThrow(() -> new NotFoundException("Request owner cannot found to confirm register!"));

        // 2. inactive Order
        registerOrder.setOrderStatus(OrderStatus.DONE);
        registerOrderRepository.save(registerOrder);

        // 3. send mail
        TournamentTeamPayload payload = TournamentTeamPayload.builder()
                .tournament(tournamentResponse)
                .team(teamResponse)
                .build();
        MessageWrapper messageWrapper = MessageWrapper.builder()
                .type(SendMailType.REGISTER_TOURNAMENT.name())
                .payload(payload)
                .toEmail(owner.getEmail())
                .toFullName(owner.getFullName())
                .build();
        //kafkaTemplate.send("register-tournament-notification-delivery", messageWrapper);
        mailService.sendMailRegisterTournament(messageWrapper.getToEmail(), tournamentResponse, teamResponse);

        return tournamentResponse;
    }
}
