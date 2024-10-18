package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.PlayerRequest;
import app.sportcenter.models.entities.Player;
import app.sportcenter.models.dto.PlayerResponse;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PlayerMapper {
    @Autowired
    private ModelMapper modelMapper;

    public PlayerResponse convertToDTO(Player player) {
        return (player != null) ? modelMapper.map(player, PlayerResponse.class) : null;
    }

    public Player convertToEntity(PlayerRequest playerRequest) {
        return (playerRequest != null) ? modelMapper.map(playerRequest, Player.class) : null;
    }
}
