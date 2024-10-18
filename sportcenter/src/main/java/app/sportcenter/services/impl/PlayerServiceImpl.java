package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.PlayerRequest;
import app.sportcenter.models.dto.PlayerResponse;
import app.sportcenter.models.entities.Player;
import app.sportcenter.repositories.PlayerRepository;
import app.sportcenter.services.PlayerService;
import app.sportcenter.utils.mappers.PlayerMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlayerServiceImpl implements PlayerService {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private PlayerMapper playerMapper;


    @Override
    public ResponseEntity<BaseResponse> create(PlayerRequest playerRequest) {
        Player player = playerMapper.convertToEntity(playerRequest);
        PlayerResponse playerResponse = playerMapper.convertToDTO(playerRepository.save(player));
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Tạo mới player thành công",
                        HttpStatus.OK.value(), playerResponse
                )
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getById(String id) {
        Player player = playerRepository.getPlayerById(id);
        if (player == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy cầu thủ (Player)", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        PlayerResponse responsePlayer = playerMapper.convertToDTO(player);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Tìm thấy cầu thủ (Player)", HttpStatus.OK.value(), responsePlayer)
        );
    }
    @Override
    public ResponseEntity<BaseResponse> update(String id, PlayerRequest playerRequest) {
        Player player = playerRepository.getPlayerById(id);
        if (player == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy cầu thủ (Player) để cập nhật", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        player.setName(playerRequest.getName());
        player.setPosition(playerRequest.getPosition());
        player.setNumber(playerRequest.getNumber());

        playerRepository.save(player);
        PlayerResponse responsePlayer = playerMapper.convertToDTO(player);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Cập nhật cầu thủ (Player) thành công", HttpStatus.OK.value(), responsePlayer)
        );
    }
    @Override
    public ResponseEntity<BaseResponse> delete(String id) {
        Player player = playerRepository.getPlayerById(id);
        if (player == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy cầu thủ (Player) để xóa", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        player.setIsDeleted(true);
        playerRepository.save(player);
        PlayerResponse responsePlayer = playerMapper.convertToDTO(player);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Xóa cầu thủ (Player) thành công", HttpStatus.OK.value(), responsePlayer)
        );
    }
    @Override
    public ResponseEntity<BaseResponse> getAll() {
        List<Player> playerList = playerRepository.getByIsDeletedFalse();
        if(playerList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Khong tim thay player", HttpStatus.OK.value(),null)
            );
        }
        List<PlayerResponse> playerResponseList = playerList.stream().map(playerMapper::convertToDTO).toList();
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Danh sach player", HttpStatus.OK.value(),playerResponseList)
        );
    }
    @Override
    public ResponseEntity<BaseResponse> restore(String id) {
        Player player = playerRepository.getPlayerById(id);
        if(player == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Khong tim thay player", HttpStatus.NOT_FOUND.value(),null)
            );
        }
        player.setIsDeleted(false);
        playerRepository.save(player);
        PlayerResponse responseSport = playerMapper.convertToDTO(player);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Khoi phuc thanh cong player", HttpStatus.OK.value(),responseSport)
        );
    }




}
