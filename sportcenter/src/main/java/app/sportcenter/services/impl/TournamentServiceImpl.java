package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.TournamentRequest;
import app.sportcenter.models.dto.TournamentResponse;
import app.sportcenter.models.entities.Tournament;
import app.sportcenter.repositories.TournamentRepository;
import app.sportcenter.services.TournamentService;
import app.sportcenter.utils.mappers.TournamentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TournamentServiceImpl implements TournamentService {
//    @Autowired
//    private TournamentRepository tournamentRepository;
//    @Autowired
//    private TournamentMapper tournamentMapper;
//
//    @Override
//    public ResponseEntity<BaseResponse> create(TournamentRequest tournamentRequest) {
//        Tournament tournament = tournamentMapper.convertToEntity(tournamentRequest);
//        TournamentResponse responseTounament = tournamentMapper.convertToDTO(tournamentRepository.save(tournament));
//
//        return ResponseEntity.status(HttpStatus.OK).body(
//                new BaseResponse("Tạo mới giải đấu thành công!", HttpStatus.OK.value(), responseTounament)
//        );
//    }
//
//    @Override
//    public ResponseEntity<BaseResponse> getById(String id) {
//        Tournament tournament = tournamentRepository.getTounamentById(id);
//        if (tournament == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
//                    new BaseResponse("Không tìm thấy giải đấu", HttpStatus.NOT_FOUND.value(), null)
//            );
//        }
//        TournamentResponse responseTounament = tournamentMapper.convertToDTO(tournament);
//        return ResponseEntity.status(HttpStatus.OK).body(
//                new BaseResponse("Tìm thấy giải đấu", HttpStatus.OK.value(), responseTounament)
//        );
//    }
//
//    @Override
//    public ResponseEntity<BaseResponse> update(String id, TournamentRequest tournamentRequest) {
//        Tournament tournament = tournamentRepository.getTounamentById(id);
//        if (tournament == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
//                    new BaseResponse("Không tìm thấy giải đấu để cập nhật", HttpStatus.NOT_FOUND.value(), null)
//            );
//        }
//        tournament.setTournamentName(tournamentRequest.getTounamentName());
//        tournament.setSport(tournamentRequest.getSport());
//        tournament.setStartDate(tournamentRequest.getStartDate());
//        tournament.setEndDate(tournamentRequest.getEndDate());
//        tournament.setMaxTeams(tournamentRequest.getMaxTeams());
////        tournament.setTeams(tournamentRequest.getTeams());
//        tournament.setRegistrationDeadline(tournamentRequest.getRegistrationDeadline());
//        tournament.setPrizes(tournamentRequest.getPrizes());
//        tournamentRepository.save(tournament);
//
//        TournamentResponse responseTounament = tournamentMapper.convertToDTO(tournament);
//        return ResponseEntity.status(HttpStatus.OK).body(
//                new BaseResponse("Cập nhật giải đấu thành công", HttpStatus.OK.value(), responseTounament)
//        );
//    }
//
//    @Override
//    public ResponseEntity<BaseResponse> delete(String id) {
//        Tournament tournament = tournamentRepository.getTounamentById(id);
//        if (tournament == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
//                    new BaseResponse("Không tìm thấy giải đấu để xóa", HttpStatus.NOT_FOUND.value(), null)
//            );
//        }
//        tournament.setIsDeleted(true);
//        tournamentRepository.save(tournament);
//
//        TournamentResponse responseTounament = tournamentMapper.convertToDTO(tournament);
//        return ResponseEntity.status(HttpStatus.OK).body(
//                new BaseResponse("Xóa giải đấu thành công", HttpStatus.OK.value(), responseTounament)
//        );
//    }
//
//    @Override
//    public ResponseEntity<BaseResponse> getAll() {
//        List<Tournament> tournamentList = tournamentRepository.getByIsDeletedFalse();
//        if (tournamentList.isEmpty()) {
//            return ResponseEntity.status(HttpStatus.OK).body(
//                    new BaseResponse("Không tìm thấy giải đấu", HttpStatus.OK.value(), null)
//            );
//        }
//        List<TournamentResponse> responseList = tournamentList.stream().map(tournamentMapper::convertToDTO).toList();
//        return ResponseEntity.status(HttpStatus.OK).body(
//                new BaseResponse("Danh sách giải đấu", HttpStatus.OK.value(), responseList)
//        );
//    }
//
//    @Override
//    public ResponseEntity<BaseResponse> restore(String id) {
//        Tournament tournament = tournamentRepository.getTounamentById(id);
//        if (tournament == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
//                    new BaseResponse("Không tìm thấy đội để khôi phục", HttpStatus.NOT_FOUND.value(), null)
//            );
//        }
//        tournament.setIsDeleted(false);
//        tournamentRepository.save(tournament);
//        TournamentResponse responseTounament = tournamentMapper.convertToDTO(tournament);
//        return ResponseEntity.status(HttpStatus.OK).body(
//                new BaseResponse("Khôi phục đội thành công", HttpStatus.OK.value(), responseTounament)
//        );
//    }
}
