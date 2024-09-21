package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.SportRequest;
import app.sportcenter.models.dto.SportResponse;
import app.sportcenter.models.entities.Sport;
import app.sportcenter.repositories.SportRepository;
import app.sportcenter.services.SportService;
import app.sportcenter.utils.mappers.SportMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class SportServiceImpl implements SportService {
    @Autowired
    private SportRepository sportRepository;
    @Autowired
    private SportMapper sportMapper;
    @Override
    public ResponseEntity<BaseResponse> create(SportRequest sportRequest) {
        Sport sport = sportMapper.convetToEntity(sportRequest);
        SportResponse responseSport = sportMapper.convertToDTO(sportRepository.save(sport));

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Tạo mới môn thể thao (Sport) thành công!",
                        HttpStatus.OK.value(),
                        responseSport)
        );
    }
}
