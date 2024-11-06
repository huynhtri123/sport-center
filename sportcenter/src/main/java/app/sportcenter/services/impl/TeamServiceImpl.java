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
import java.util.List;

@Slf4j
@Service
public class TeamServiceImpl implements TeamService {
    @Autowired
    private TeamRepository teamRepository;
    @Autowired
    private TournamentRepository tournamentRepository;
    @Autowired
    private CloudinaryService cloudinaryService;
    @Autowired
    private AppConfig appConfig;

    @Autowired
    private TeamMapper teamMapper;

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> create(TeamRequest teamRequest) {
        // lấy thông tin người đang đăng nhập làm chủ sở hữu team
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Không tìm thấy thông tin đăng nhập!", HttpStatus.BAD_REQUEST.value());
        }
        String userId = currentUser.getId();

        // nếu image input trống thì tạo bằng ảnh mặc định
        if (teamRequest.getTeamLogoUrl() == null || teamRequest.getTeamLogoUrl().isEmpty()) {
            teamRequest.setTeamLogoUrl(appConfig.getDefaultIcon());
        }

        Team team = teamMapper.convertToEntity(teamRequest, userId);
        TeamResponse responseTeam = teamMapper.convertToDTO(teamRepository.save(team));

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new BaseResponse("Tạo mới đội thành công!",
                        HttpStatus.CREATED.value(),
                        responseTeam)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getById(String id) {
        Team team = teamRepository.getTeamById(id);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy đội", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        TeamResponse responseTeam = teamMapper.convertToDTO(team);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Tìm thấy đội", HttpStatus.OK.value(), responseTeam)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAll() {
        List<Team> teamList = teamRepository.getByIsDeletedFalseAndIsActiveTrue();
        if (teamList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Không tìm thấy đội", HttpStatus.OK.value(), null)
            );
        }
        List<TeamResponse> teamResponseList = teamList.stream().map(teamMapper::convertToDTO).toList();
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Danh sách đội", HttpStatus.OK.value(), teamResponseList)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> myTeams(String userId) {
        List<Team> myTeams = teamRepository.getTeamByUserIdAndIsActiveTrueAndIsDeletedFalse(userId);
        if (myTeams.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy Teams của bạn!", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        List<TeamResponse> responseList = myTeams.stream().map(teamMapper::convertToDTO).toList();
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Tìm thấy Teams của bạn!", HttpStatus.OK.value(), responseList)
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> update(String id, TeamRequest teamRequest) {
        Team team = teamRepository.getTeamById(id);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy đội để cập nhật", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        // kiểm tra xem người đăng nhập hiện tại có đúng là chủ tạo team không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Không tìm thấy thông tin đăng nhập!", HttpStatus.BAD_REQUEST.value());
        }
        String userId = currentUser.getId();

        // nếu đăng nhập đúng, hoặc là admin thì đươc cập nhật
        if (userId.equals(team.getUserId()) || currentUser.getRole().equals(Role.ADMIN)) {
            Team updatedTeam = teamMapper.updateEntityFromRequest(teamRequest, team);
            teamRepository.save(updatedTeam);

            TeamResponse responseTeam = teamMapper.convertToDTO(updatedTeam);
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Cập nhật đội thành công", HttpStatus.OK.value(), responseTeam)
            );
        } else {
            throw new CustomException("Bạn không có quyền cập nhật Team của người khác!", HttpStatus.BAD_REQUEST.value());
        }
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> softDelete(String id) {
        Team team = teamRepository.getTeamById(id);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy đội để xóa", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        // kiểm tra xem người đăng nhập hiện tại có đúng là chủ tạo team không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Không tìm thấy thông tin đăng nhập!", HttpStatus.BAD_REQUEST.value());
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
                    throw new CustomException("Team này đang có tham gia giải đấu, bạn không thể xoá nó!", HttpStatus.BAD_REQUEST.value());
                }
            }

            team.setIsDeleted(true);
            teamRepository.save(team);

            TeamResponse responseTeam = teamMapper.convertToDTO(team);
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Xóa đội thành công", HttpStatus.OK.value(), responseTeam)
            );

        } else {
            throw new CustomException("Bạn không có quyền xoá Team của người khác!", HttpStatus.BAD_REQUEST.value());
        }
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> restore(String id) {
        Team team = teamRepository.getTeamById(id);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy đội để khôi phục", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        // kiểm tra xem người đăng nhập hiện tại có đúng là chủ tạo team không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Không tìm thấy thông tin đăng nhập!", HttpStatus.BAD_REQUEST.value());
        }
        String userId = currentUser.getId();

        // nếu đăng nhập đúng, hoặc là admin thì đươc cập nhật
        if (userId.equals(team.getUserId()) || currentUser.getRole().equals(Role.ADMIN)) {
            team.setIsDeleted(true);
            teamRepository.save(team);
            TeamResponse responseTeam = teamMapper.convertToDTO(team);
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Khôi phục đội thành công", HttpStatus.OK.value(), responseTeam)
            );
        } else {
            throw new CustomException("Bạn không có quyền khôi phục Team của người khác!", HttpStatus.BAD_REQUEST.value());
        }
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> forceDelete(String id) {
        Team team = teamRepository.getTeamById(id);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy đội để xoá cứng", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        // kiểm tra xem người đăng nhập hiện tại có đúng là chủ tạo team không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Không tìm thấy thông tin đăng nhập!", HttpStatus.BAD_REQUEST.value());
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
                    throw new CustomException("Team này đang có tham gia giải đấu, bạn không thể xoá nó!", HttpStatus.BAD_REQUEST.value());
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
                    new BaseResponse("Xoá cứng đội thành công", HttpStatus.OK.value(), responseTeam)
            );
        } else {
            throw new CustomException("Bạn không có quyền xoá cứng Team của người khác!", HttpStatus.BAD_REQUEST.value());
        }
    }
}
