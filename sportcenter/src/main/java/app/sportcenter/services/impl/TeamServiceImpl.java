package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.Role;
import app.sportcenter.configs.AppConfig;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.TeamRequest;
import app.sportcenter.models.dto.TeamResponse;
import app.sportcenter.models.entities.Team;
import app.sportcenter.models.entities.Tournament;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.TeamRepository;
import app.sportcenter.repositories.TournamentRepository;
import app.sportcenter.services.CloudinaryService;
import app.sportcenter.services.TeamService;
import app.sportcenter.utils.mappers.TeamMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {
    private final TeamRepository teamRepository;
    private final TournamentRepository tournamentRepository;
    private final CloudinaryService cloudinaryService;
    private final AppConfig appConfig;
    private final TeamMapper teamMapper;

    @Transactional
    @Override
    public TeamResponse create(TeamRequest teamRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Login information not found!", HttpStatus.BAD_REQUEST.value());
        }
        String userId = currentUser.getId();

        // kiểm tra xem có đội nào có tên này chưa
        if (checkExistedTeam(teamRequest.getTeamName())) {
            throw new CustomException("Team name already exists, please choose a different name!", HttpStatus.BAD_REQUEST.value());
        }

        // nếu image input trống thì tạo bằng ảnh mặc định
        if (teamRequest.getTeamLogoUrl() == null || teamRequest.getTeamLogoUrl().isEmpty()) {
            teamRequest.setTeamLogoUrl(appConfig.getDefaultIcon());
        }

        Team team = teamMapper.convertToEntity(teamRequest, userId);

        return teamMapper.convertToDTO(teamRepository.save(team));
    }

    @Override
    public ResponseEntity<BaseResponse> getById(String id) {
        Team team = teamRepository.getTeamById(id);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Team not found", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        TeamResponse responseTeam = teamMapper.convertToDTO(team);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Team found.", HttpStatus.OK.value(), responseTeam)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAll() {
        List<Team> teamList = teamRepository.getByIsDeletedFalseAndIsActiveTrue();
        if (teamList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Team not found.", HttpStatus.OK.value(), null)
            );
        }
        List<TeamResponse> teamResponseList = teamList.stream()
                .map(teamMapper::convertToDTO)
                .sorted(Comparator.comparing(TeamResponse::getCreatedAt).reversed())
                .toList();
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Team list", HttpStatus.OK.value(), teamResponseList)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> myTeams(String userId) {
        List<Team> myTeams = teamRepository.getTeamByUserIdAndIsActiveTrueAndIsDeletedFalse(userId);
        if (myTeams.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Your teams not found!", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        List<TeamResponse> responseList = myTeams.stream().map(teamMapper::convertToDTO).toList();
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Your teams found!", HttpStatus.OK.value(), responseList)
        );
    }

    @Transactional
    @Override
    public TeamResponse update(String id, TeamRequest teamRequest) {
        Team team = teamRepository.getTeamById(id);
        if (team == null) {
            throw new NotFoundException("No team found for update");
        }

        // kiểm tra xem người đăng nhập hiện tại có đúng là chủ tạo team không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Login information not found!", HttpStatus.BAD_REQUEST.value());
        }
        String userId = currentUser.getId();

        // nếu đăng nhập đúng, hoặc là admin thì đươc cập nhật
        if (userId.equals(team.getUserId()) || currentUser.getRole().equals(Role.ADMIN)) {
            Team updatedTeam = teamMapper.updateEntityFromRequest(teamRequest, team);
            teamRepository.save(updatedTeam);

            return teamMapper.convertToDTO(updatedTeam);
        } else {
            throw new CustomException("You do not have permission to update someone else's team!", HttpStatus.BAD_REQUEST.value());
        }
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> softDelete(String id) {
        Team team = teamRepository.getTeamById(id);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("No team found for deletion", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        // kiểm tra xem người đăng nhập hiện tại có đúng là chủ tạo team không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Login information not found!", HttpStatus.BAD_REQUEST.value());
        }
        String userId = currentUser.getId();

        // nếu đăng nhập đúng, hoặc là admin thì đươc cập nhật
        if (userId.equals(team.getUserId()) || currentUser.getRole().equals(Role.ADMIN)) {
            // tìm xem nếu có bất kỳ giải đấu nào có chứa Team thì ko cho xoá
            List<Tournament> tournamentsWithTeam = tournamentRepository.findByRegisteredTeamId(team.getId());
            if (!tournamentsWithTeam.isEmpty()) {
                ZonedDateTime now = ZonedDateTime.now().plusHours(7);   // về giờ vn
                boolean hasActiveTournament = tournamentsWithTeam.stream()
                        .anyMatch((tournament ->
                                tournament.getIsActive() &&
                                        !tournament.getIsDeleted() &&
                                        tournament.getEndDate().isAfter(now)
                                ));
                if (hasActiveTournament) {
                    throw new CustomException("This team is participating in a tournament, you cannot delete it!", HttpStatus.BAD_REQUEST.value());
                }
            }

            team.setIsDeleted(true);
            teamRepository.save(team);

            TeamResponse responseTeam = teamMapper.convertToDTO(team);
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Team deleted successfully", HttpStatus.OK.value(), responseTeam)
            );

        } else {
            throw new CustomException("You do not have permission to delete someone else's team!", HttpStatus.BAD_REQUEST.value());
        }
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> restore(String id) {
        Team team = teamRepository.getTeamById(id);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("No team found to restore", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        // kiểm tra xem người đăng nhập hiện tại có đúng là chủ tạo team không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Login information not found!", HttpStatus.BAD_REQUEST.value());
        }
        String userId = currentUser.getId();

        // nếu đăng nhập đúng, hoặc là admin thì đươc cập nhật
        if (userId.equals(team.getUserId()) || currentUser.getRole().equals(Role.ADMIN)) {
            team.setIsDeleted(true);
            teamRepository.save(team);
            TeamResponse responseTeam = teamMapper.convertToDTO(team);
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Team restored successfully", HttpStatus.OK.value(), responseTeam)
            );
        } else {
            throw new CustomException("You do not have permission to restore someone else's team!", HttpStatus.BAD_REQUEST.value());
        }
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> forceDelete(String id) {
        Team team = teamRepository.getTeamById(id);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("No team found for permanent deletion", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        // kiểm tra xem người đăng nhập hiện tại có đúng là chủ tạo team không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Login information not found!", HttpStatus.BAD_REQUEST.value());
        }
        String userId = currentUser.getId();

        // nếu đăng nhập đúng, hoặc là admin thì đươc cập nhật
        if (userId.equals(team.getUserId()) || currentUser.getRole().equals(Role.ADMIN)) {
            // tìm xem nếu có bất kỳ giải đấu nào có chứa Team thì ko cho xoá
            List<Tournament> tournamentsWithTeam = tournamentRepository.findByRegisteredTeamId(team.getId());
            if (!tournamentsWithTeam.isEmpty()) {
                ZonedDateTime now = ZonedDateTime.now().plusHours(7);   // về giờ vn
                boolean hasActiveTournament = tournamentsWithTeam.stream()
                        .anyMatch((tournament ->
                                tournament.getIsActive() &&
                                        !tournament.getIsDeleted() &&
                                        tournament.getEndDate().isAfter(now)
                        ));
                if (hasActiveTournament) {
                    throw new CustomException("This team is participating in a tournament, you cannot delete it!", HttpStatus.BAD_REQUEST.value());
                }
            }

            // Xóa ảnh từ Cloudinary (chỉ xoá ảnh không phải ảnh mặc định)
            try {
                if (team.getTeamLogoUrl() != null && !team.getTeamLogoUrl().equals(appConfig.getDefaultIcon())) {
                    cloudinaryService.deleteByUrl(team.getTeamLogoUrl());
                    log.info("Đã xóa ảnh logo của đội với ID: {}", id);
                }
            } catch (IOException e) {
                log.error("Lỗi khi xóa ảnh trên Cloudinary: {}", e.getMessage());
            }
            // xoá Team
            teamRepository.deleteById(id);
            TeamResponse responseTeam = teamMapper.convertToDTO(team);
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Team permanently deleted successfully", HttpStatus.OK.value(), responseTeam)
            );
        } else {
            throw new CustomException("You do not have permission to permanently delete someone else's team!", HttpStatus.BAD_REQUEST.value());
        }
    }

    @Override
    public boolean checkExistedTeam(String teamName) {
        List<Team> sameNameTeams = teamRepository.getTeamByTeamName(teamName.trim());
        return !sameNameTeams.isEmpty();    // đã tồn tại -> return true
    }
}
