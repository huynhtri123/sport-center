package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.TounamentRequest;
import app.sportcenter.models.dto.TounamentResponse;
import app.sportcenter.models.entities.Tounament;
import app.sportcenter.repositories.TounamentRepository;
import app.sportcenter.services.TounamentService;
import app.sportcenter.utils.mappers.TounamentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TounamentServiceImpl implements TounamentService {
    @Autowired
    private TounamentRepository tounamentRepository;
    @Autowired
    private TounamentMapper tounamentMapper;

    @Override
    public ResponseEntity<BaseResponse> create(TounamentRequest tounamentRequest) {
        Tounament tounament = tounamentMapper.convertToEntity(tounamentRequest);
        TounamentResponse responseTounament = tounamentMapper.convertToDTO(tounamentRepository.save(tounament));

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Tạo mới giải đấu thành công!", HttpStatus.OK.value(), responseTounament)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getById(String id) {
        Tounament tounament = tounamentRepository.getTounamentById(id);
        if (tounament == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy giải đấu", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        TounamentResponse responseTounament = tounamentMapper.convertToDTO(tounament);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Tìm thấy giải đấu", HttpStatus.OK.value(), responseTounament)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> update(String id, TounamentRequest tounamentRequest) {
        Tounament tounament = tounamentRepository.getTounamentById(id);
        if (tounament == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy giải đấu để cập nhật", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        tounament.setTounamentName(tounamentRequest.getTounamentName());
        tounament.setSport(tounamentRequest.getSport());
        tounament.setStartDate(tounamentRequest.getStartDate());
        tounament.setEndDate(tounamentRequest.getEndDate());
        tounament.setMaxTeams(tounamentRequest.getMaxTeams());
        tounament.setTeams(tounamentRequest.getTeams());
        tounament.setRegistrationDeadline(tounamentRequest.getRegistrationDeadline());
        tounament.setPrizes(tounamentRequest.getPrizes());
        tounamentRepository.save(tounament);

        TounamentResponse responseTounament = tounamentMapper.convertToDTO(tounament);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Cập nhật giải đấu thành công", HttpStatus.OK.value(), responseTounament)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> delete(String id) {
        Tounament tounament = tounamentRepository.getTounamentById(id);
        if (tounament == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy giải đấu để xóa", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        tounament.setIsDeleted(true);
        tounamentRepository.save(tounament);

        TounamentResponse responseTounament = tounamentMapper.convertToDTO(tounament);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Xóa giải đấu thành công", HttpStatus.OK.value(), responseTounament)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAll() {
        List<Tounament> tounamentList = tounamentRepository.getByIsDeletedFalse();
        if (tounamentList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.OK).body(
                    new BaseResponse("Không tìm thấy giải đấu", HttpStatus.OK.value(), null)
            );
        }
        List<TounamentResponse> responseList = tounamentList.stream().map(tounamentMapper::convertToDTO).toList();
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Danh sách giải đấu", HttpStatus.OK.value(), responseList)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> restore(String id) {
        Tounament tounament = tounamentRepository.getTounamentById(id);
        if (tounament == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy đội để khôi phục", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        tounament.setIsDeleted(false);
        tounamentRepository.save(tounament);
        TounamentResponse responseTounament = tounamentMapper.convertToDTO(tounament);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Khôi phục đội thành công", HttpStatus.OK.value(), responseTounament)
        );
    }
}
