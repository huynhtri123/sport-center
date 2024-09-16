package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.SportRequestDTO;
import app.sportcenter.models.dto.SportResponseDTO;
import app.sportcenter.models.entities.Sport;
import app.sportcenter.repositories.SportRepository;
import app.sportcenter.utils.mappers.SportMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class SportServiceImpl implements SportService{
    @Autowired
    private SportRepository sportRepository;
    @Autowired
    private SportMapper sportMapper;
    @Override
    public ResponseEntity<BaseResponse> create(SportRequestDTO sportRequestDTO) {
        Sport sport = sportMapper.convetToEntity(sportRequestDTO);
        SportResponseDTO responseSport = sportMapper.convertToDTO(sportRepository.save(sport));

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Tạo mới môn thể thao (Sport) thành công!",
                        HttpStatus.OK.value(),
                        responseSport)
        );
    }
}
