package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.PaginatedResponse;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.request.SportRequest;
import app.sportcenter.models.dto.response.SportResponse;
import app.sportcenter.models.entities.Course;
import app.sportcenter.models.entities.Field;
import app.sportcenter.models.entities.Sport;
import app.sportcenter.models.entities.Tournament;
import app.sportcenter.repositories.CourseRepository;
import app.sportcenter.repositories.FieldRepository;
import app.sportcenter.repositories.SportRepository;
import app.sportcenter.repositories.TournamentRepository;
import app.sportcenter.services.SportService;
import app.sportcenter.utils.mappers.SportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SportServiceImpl implements SportService {
    private final SportRepository sportRepository;
    private final SportMapper sportMapper;
    private final TournamentRepository tournamentRepository;
    private final FieldRepository fieldRepository;
    private final CourseRepository courseRepository;

    @Override
    public ResponseEntity<BaseResponse> create(SportRequest sportRequest) {
        Sport sport = sportMapper.convetToEntity(sportRequest);
        if (sport == null) {
            throw new CustomException("Inputs are null!", HttpStatus.BAD_REQUEST.value());

        }
        SportResponse responseSport = sportMapper.convertToDTO(sportRepository.save(sport));

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Sport created successfully!",
                        HttpStatus.OK.value(),
                        responseSport)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getById(String id) {
        Sport sport = sportRepository.getSportById(id);
        if(sport == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Sport not found.", HttpStatus.NOT_FOUND.value(),null)
            );
        }
        SportResponse responseSport = sportMapper.convertToDTO(sport);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Sport found.", HttpStatus.OK.value(),responseSport)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> update(String id, SportRequest sportRequest) {
        Sport sport = sportRepository.getSportById(id);
        if(sport == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Sport not found for update.", HttpStatus.NOT_FOUND.value(),null)
            );
        }
        sport.setSportName(sportRequest.getSportName());
        sport.setDescription(sportRequest.getDescription());
        sport.setImageUrl(sportRequest.getImageUrl());
        sportRepository.save(sport);
        SportResponse responseSport = sportMapper.convertToDTO(sport);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Update sport sucssfully!", HttpStatus.OK.value(),responseSport)
        );

    }

    @Override
    public ResponseEntity<BaseResponse> softDelete(String id) {
        Sport sport = sportRepository.getSportById(id);

        // Check if the sport exists
        if (sport == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Sport not found for deletion.", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        // kiem tra co san nao khong
        List<Field> relevantFields = fieldRepository.findBySportIdAndIsActiveTrueAndIsDeletedFalse(id);
        if (!relevantFields.isEmpty()) {
            throw new CustomException("Cannot delete because there are sports fields currently being used for this sport!", HttpStatus.BAD_REQUEST.value());
        }

        // kiem tra co khoa hoc nao khong
        List<Course> relevantCourses = courseRepository.findBySportIdAndIsActiveTrueAndIsDeletedFalse(id);
        if (!relevantCourses.isEmpty()) {
            throw new CustomException("Cannot delete because there are sports courses currently being used for this sport!", HttpStatus.BAD_REQUEST.value());
        }

        // kiem tra co giai dau nao khong
        List<Tournament> relevantTournaments = tournamentRepository.findBySportIdAndIsActiveTrueAndIsDeletedFalse(id);
        if (!relevantTournaments.isEmpty()) {
            throw new CustomException("Cannot delete because there are sports tournaments currently being used for this sport!", HttpStatus.BAD_REQUEST.value());
        }

        // Check if any active, non-deleted tournaments are associated with this sport
        boolean hasAssociatedTournaments = tournamentRepository.existsBySportIdAndIsActiveTrueAndIsDeletedFalse(id);
        if (hasAssociatedTournaments) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new BaseResponse("Cannot delete the sport because it is being used in tournaments.", HttpStatus.BAD_REQUEST.value(), null)
            );
        }

        // Mark the sport as deleted
        sport.setIsDeleted(true);
        sportRepository.save(sport);

        // Convert the sport entity to a DTO for the response
        SportResponse responseSport = sportMapper.convertToDTO(sport);

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Sport deleted successfully.", HttpStatus.OK.value(), responseSport)
        );
    }


    @Override
    public ResponseEntity<BaseResponse> getAllActive(int page, int size) {
        //Pageable pageable = PageRequest.of(page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Sport> activeSportsPage = sportRepository.findAllActive(pageable);

        if (activeSportsPage.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("No active sport found.", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        List<SportResponse> response = activeSportsPage.getContent()
                .stream()
                .map(sportMapper::convertToDTO) // Convert Sport to SportResponse DTO
                .collect(Collectors.toList());

        // Create a PaginatedResponse object
        PaginatedResponse<SportResponse> paginatedResponse = new PaginatedResponse<>(
                response,
                activeSportsPage.getTotalPages(),
                activeSportsPage.getTotalElements()
        );

        // Return the BaseResponse with paginated data
        return ResponseEntity.ok(
                new BaseResponse(
                        "Active sports list found.",
                        HttpStatus.OK.value(),
                        paginatedResponse
                )
        );
    }

    @Override
    public ResponseEntity<BaseResponse> restore(String id) {
        Sport sport = sportRepository.getSportById(id);
        if(sport == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Sport not found.", HttpStatus.NOT_FOUND.value(),null)
            );
        }
        sport.setIsDeleted(false);
        sportRepository.save(sport);
        SportResponse responseSport = sportMapper.convertToDTO(sport);
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Sport restored successfully.", HttpStatus.OK.value(),responseSport)
        );
    }
}
