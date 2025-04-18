package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.PaginatedResponse;
import app.sportcenter.configs.AppConfig;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.request.FieldRequest;
import app.sportcenter.models.dto.response.FieldResponse;
import app.sportcenter.models.dto.request.PricePolicyRequest;
import app.sportcenter.models.entities.Booking;
import app.sportcenter.models.entities.Field;
import app.sportcenter.repositories.BookingRepository;
import app.sportcenter.repositories.FieldRepository;
import app.sportcenter.services.CloudinaryService;
import app.sportcenter.services.FieldService;
import app.sportcenter.utils.mappers.FieldMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class FieldServiceImpl implements FieldService {

    private final FieldRepository fieldRepository;
    private final BookingRepository bookingRepository;
    private final FieldMapper fieldMapper;
    private final AppConfig appConfig;
    private final CloudinaryService cloudinaryService;

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> create(FieldRequest fieldRequest) {
        // kiểm tra trùng lặp ngày trong các pricePolicies
        if (hasDuplicateDays(fieldRequest.getPricePolicies())) {
            throw new CustomException("Failed due to overlapping dates in pricing policies!", HttpStatus.BAD_REQUEST.value());
        }

        // set ảnh và video mặc định
        if (fieldRequest.getImageUrl() == null || fieldRequest.getImageUrl().isEmpty()) {
            fieldRequest.setImageUrl(appConfig.getDefaultIcon());
        }
        if (fieldRequest.getVideoUrl() == null || fieldRequest.getVideoUrl().isEmpty()) {
            fieldRequest.setVideoUrl(appConfig.getDefaultIcon());
        }

        Field field = fieldMapper.convertToEntity(fieldRequest);
        if (field == null) {
            throw new CustomException("Map fieldRequest to entity thất bại!", HttpStatus.BAD_REQUEST.value());
        }
        FieldResponse responseField = fieldMapper.convertToDTO(fieldRepository.save(field));
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(
                new BaseResponse("Field created successfully!", HttpStatus.CREATED.value(), responseField)
        );
    }

    private boolean hasDuplicateDays(List<PricePolicyRequest> pricePolicies) {
        Set<Integer> allDays = new HashSet<>(); // Sử dụng HashSet để tránh trùng
        for (PricePolicyRequest pricePolicy : pricePolicies) {
            for (Integer day : pricePolicy.getDaysOfWeek()) {
                // Nếu ngày đã có trong set thì có sự trùng lặp
                if (!allDays.add(day)) {
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public ResponseEntity<BaseResponse> getAllActive(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Field> fieldPage = fieldRepository.findAllActive(pageable);

        if (fieldPage.isEmpty()) {
            return ResponseEntity.ok(
                    new BaseResponse("No fields found.", HttpStatus.OK.value(), null)
            );
        }

        List<FieldResponse> responseFields = fieldPage.getContent()
                .stream()
                .map(fieldMapper::convertToDTO)
                .collect(Collectors.toList());

        PaginatedResponse<FieldResponse> paginatedResponse = new PaginatedResponse<>(
                responseFields,
                fieldPage.getTotalPages(),
                fieldPage.getTotalElements()
        );

        return ResponseEntity.ok(
                new BaseResponse("Field list found.", HttpStatus.OK.value(), paginatedResponse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getById(String fieldId) {
        Field field = fieldRepository.findById(fieldId).orElseThrow(
                () -> new NotFoundException("No field found!")
        );

        FieldResponse responseField = fieldMapper.convertToDTO(field);
        return ResponseEntity.ok(
                new BaseResponse("Field found.", HttpStatus.OK.value(), responseField)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAllSoftDeleted() {
        List<Field> listDeleted = fieldRepository.getFieldByIsDeletedTrue();
        if (listDeleted.isEmpty()) {
            throw new NotFoundException("No soft-deleted fields found.");
        }

        List<FieldResponse> responseField = listDeleted.stream().map(fieldMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Soft-deleted field list found.", HttpStatus.OK.value(), responseField)
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> updateById(String fieldId, FieldRequest newField) {
        // kiểm tra trùng lặp ngày trong các pricePolicies
        if (hasDuplicateDays(newField.getPricePolicies())) {
            throw new CustomException("Failed due to overlapping dates in pricing policies!", HttpStatus.BAD_REQUEST.value());
        }
        Field field = fieldRepository.findById(fieldId).orElseThrow(() ->
                new NotFoundException("Field not found!"));

        Field updatedField = fieldRepository.save(fieldMapper.replaceAll(field, newField));

        FieldResponse responseField = fieldMapper.convertToDTO(updatedField);

        return ResponseEntity.ok(
                new BaseResponse("Field updated successfully.", HttpStatus.OK.value(), responseField)
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> toggleActiveStatus(String fieldId) {
        Field field = fieldRepository.findById(fieldId).orElseThrow(() ->
                new NotFoundException("Field not found!"));

        field.setIsActive(!field.getIsActive());
        Field updatedField = fieldRepository.save(field);

        FieldResponse responseField = fieldMapper.convertToDTO(updatedField);
        return ResponseEntity.ok(
                new BaseResponse("Active status updated successfully."
                        + "Current field status: " + updatedField.getIsActive(),
                        HttpStatus.OK.value(),
                        responseField)
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> softDeleted(String fieldId) {
        Field field = fieldRepository.findById(fieldId).orElseThrow(() ->
                new NotFoundException("Field not found!"));

        // tìm coi có bất kỳ Booking nào đang chứa Field này thì không cho xoá luôn
        List<Booking> relevantBookings = bookingRepository.getBookingByFieldId(fieldId);
        if (!relevantBookings.isEmpty()) {
            ZonedDateTime now = ZonedDateTime.now().plusHours(7); // vì khi tạo booking ta trừ 7
            boolean hasActiveBookings = relevantBookings.stream()
                    .anyMatch(booking -> booking.getIsActive() && booking.getEndTime().isAfter(now));
            if (hasActiveBookings) {
                throw new CustomException("There is an active booking associated with this field, you cannot delete it!",
                        HttpStatus.BAD_REQUEST.value());
            }
        }

        field.setIsDeleted(true);
        Field updatedField = fieldRepository.save(field);
        FieldResponse responseField = fieldMapper.convertToDTO(updatedField);

        return ResponseEntity.ok(
                new BaseResponse("Field soft-deleted successfully.", HttpStatus.OK.value(), responseField)
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> restore(String fieldId) {
        Field field = fieldRepository.findById(fieldId).orElseThrow(() ->
                new NotFoundException("Field not found!"));

        field.setIsDeleted(false);

        Field updatedField = fieldRepository.save(field);
        FieldResponse responseField = fieldMapper.convertToDTO(updatedField);

        return ResponseEntity.ok(
                new BaseResponse("Field restored successfully.", HttpStatus.OK.value(), responseField)
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> forceDelete(String fieldId) {
        Field field = fieldRepository.findById(fieldId).orElseThrow(() ->
                new NotFoundException("Field not found!"));
        FieldResponse resonseField = fieldMapper.convertToDTO(field);

        // tìm coi có bất kỳ Booking nào đang chứa Field này thì không cho xoá luôn
        List<Booking> relevantBookings = bookingRepository.getBookingByFieldId(fieldId);
        if (!relevantBookings.isEmpty()) {
            ZonedDateTime now = ZonedDateTime.now().plusHours(7); // vì khi tạo booking ta trừ 7
            boolean hasActiveBookings = relevantBookings.stream()
                    .anyMatch(booking -> booking.getIsActive() && booking.getEndTime().isAfter(now));
            if (hasActiveBookings) {
                throw new CustomException("There is an active booking associated with this field, you cannot delete it!",
                        HttpStatus.BAD_REQUEST.value());
            }
        }
        // Xóa ảnh từ Cloudinary (chỉ xoá ảnh không phải ảnh mặc định)
        try {
            if (field.getImageUrl() != null && !field.getImageUrl().equals(appConfig.getDefaultIcon())) {
                cloudinaryService.deleteByUrl(field.getImageUrl());
                log.info("Đã xóa ảnh logo của field với ID: {}", field.getId());
            }
        } catch (IOException e) {
            log.error("Lỗi khi xóa ảnh trên Cloudinary: {}", e.getMessage());
        }
        // xoá cứng
        fieldRepository.deleteById(fieldId);

        return ResponseEntity.ok(
                new BaseResponse("Field permanently deleted successfully.", HttpStatus.OK.value(), resonseField)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(String fieldName) {
        List<Field> fieldList = fieldRepository.searchByFieldNameContainingIgnoreCase(fieldName);

        if (fieldList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("No field found with this name.", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        List<FieldResponse> responseFields = fieldList.stream()
                .map(fieldMapper::convertToDTO)
                .sorted(Comparator.comparing(FieldResponse::getCreatedAt).reversed())
                .toList();
        return ResponseEntity.ok(
                new BaseResponse("\n" +
                        "Field list found.", HttpStatus.OK.value(), responseFields)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> findBySportId(String sportId) {
        List<Field> fieldList = fieldRepository.findBySportIdAndIsActiveTrueAndIsDeletedFalse(sportId);
        if (fieldList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("No fields found for the specified sportId. " + sportId + ".", HttpStatus.NOT_FOUND.value(), null)
            );
        }
        fieldList.sort(Comparator.comparing(Field::getCreatedAt).reversed());
        List<FieldResponse> responseFields = fieldList.stream().map(fieldMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Field list found for the specified sportId. " + sportId + ".", HttpStatus.OK.value(), responseFields)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> searchByNameAndPaginate(String fieldName, int page, int size) {
        //Pageable pageable = PageRequest.of(page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Field> fieldPage = fieldRepository.searchByFieldNameContainingIgnoreCase(fieldName, pageable);

        List<FieldResponse> responseFields = fieldPage.getContent()
                .stream()
                .map(fieldMapper::convertToDTO)
                .collect(Collectors.toList());

        PaginatedResponse<FieldResponse> paginatedResponse = new PaginatedResponse<>(
                responseFields,
                fieldPage.getTotalPages(),
                fieldPage.getTotalElements()
        );

        return ResponseEntity.ok(
                new BaseResponse("Field list found.", HttpStatus.OK.value(), paginatedResponse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> filterBySportIdAndPaginate(String sportId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Field> fieldPage = fieldRepository.filterBySportId(sportId, pageable);

        List<FieldResponse> responseFields = fieldPage.getContent()
                .stream()
                .map(fieldMapper::convertToDTO)
                .collect(Collectors.toList());

        PaginatedResponse<FieldResponse> paginatedResponse = new PaginatedResponse<>(
                responseFields,
                fieldPage.getTotalPages(),
                fieldPage.getTotalElements()
        );

        return ResponseEntity.ok(
                new BaseResponse("Field list found by sportId.", HttpStatus.OK.value(), paginatedResponse)
        );
    }

}
