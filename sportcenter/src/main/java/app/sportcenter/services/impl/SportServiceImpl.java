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

import java.util.List;

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

    @Override
    public ResponseEntity<BaseResponse> getById(String id) {
        Sport sport = sportRepository.getSportById(id);
        if(sport == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Khong tim thay sport", HttpStatus.NOT_FOUND.value(),null)
            );
        }
        SportResponse responseSport = sportMapper.convertToDTO(sport);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Tim thay sport", HttpStatus.OK.value(),responseSport)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> update(String id, SportRequest sportRequest) {
        Sport sport = sportRepository.getSportById(id);
        if(sport == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Khong tim thay sport de update", HttpStatus.NOT_FOUND.value(),null)
            );
        }
        sport.setSportName(sportRequest.getSportName());
        sport.setDescription(sportRequest.getDescription());
        sport.setImageUrl(sportRequest.getImageUrl());
        sportRepository.save(sport);
        SportResponse responseSport = sportMapper.convertToDTO(sport);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Tim thay sport de update", HttpStatus.OK.value(),responseSport)
        );

    }

    @Override
    public ResponseEntity<BaseResponse> delete(String id) {
        Sport sport = sportRepository.getSportById(id);
        if(sport == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Khong tim thay sport de xoa", HttpStatus.NOT_FOUND.value(),null)
            );
        }
        sport.setIsDeleted(true);
        sportRepository.save(sport);
        SportResponse responseSport = sportMapper.convertToDTO(sport);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Xoa thanh cong sport", HttpStatus.OK.value(),responseSport)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAll() {
        List<Sport> sportList = sportRepository.getByIsDeletedFalse();
        if(sportList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Khong tim thay sport", HttpStatus.OK.value(),null)
            );
        }
        List<SportResponse> sportResponseList = sportList.stream().map(sportMapper::convertToDTO).toList();
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Danh sach sport", HttpStatus.OK.value(),sportResponseList)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> restore(String id) {
        Sport sport = sportRepository.getSportById(id);
        if(sport == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Khong tim thay sport", HttpStatus.NOT_FOUND.value(),null)
            );
        }
        sport.setIsDeleted(false);
        sportRepository.save(sport);
        SportResponse responseSport = sportMapper.convertToDTO(sport);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Khoi phuc thanh cong sport", HttpStatus.OK.value(),responseSport)
        );
    }
}
