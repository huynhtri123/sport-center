package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.TeamRequest;
import app.sportcenter.models.dto.TeamResponse;
import app.sportcenter.models.entities.Team;
import app.sportcenter.repositories.TeamRepository;
import app.sportcenter.services.TeamService;
import app.sportcenter.utils.mappers.TeamMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class TeamServiceImpl implements TeamService {
    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private TeamMapper teamMapper;

    @Override
    public ResponseEntity<BaseResponse> create(TeamRequest teamRequest) {
        Team team = teamMapper.convertToEntity(teamRequest);
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
    public ResponseEntity<BaseResponse> update(String id, TeamRequest teamRequest) {
        Team team = teamRepository.getTeamById(id);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy đội để cập nhật", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        team.setTeamName(teamRequest.getTeamName());
        team.setCaptain(teamRequest.getCaptain());
        team.setPlayers(teamRequest.getPlayers());
        team.setTeamLogoUrl(teamRequest.getTeamLogoUrl());
        team.setEnrolledTounaments(teamRequest.getEnrolledTournaments());
        team.setWonPrizes(teamRequest.getWonPrizeIds());

        teamRepository.save(team);
        TeamResponse responseTeam = teamMapper.convertToDTO(team);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Cập nhật đội thành công", HttpStatus.OK.value(), responseTeam)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> delete(String id) {
        Team team = teamRepository.getTeamById(id);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy đội để xóa", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        team.setIsDeleted(true);
        teamRepository.save(team);
        TeamResponse responseTeam = teamMapper.convertToDTO(team);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Xóa đội thành công", HttpStatus.OK.value(), responseTeam)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAll() {
        List<Team> teamList = teamRepository.getByIsDeletedFalse(); // Assuming there's a method to get non-deleted teams
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
    public ResponseEntity<BaseResponse> restore(String id) {
        Team team = teamRepository.getTeamById(id);
        if (team == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy đội để khôi phục", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        team.setIsDeleted(false);
        teamRepository.save(team);
        TeamResponse responseTeam = teamMapper.convertToDTO(team);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Khôi phục đội thành công", HttpStatus.OK.value(), responseTeam)
        );
    }
}
