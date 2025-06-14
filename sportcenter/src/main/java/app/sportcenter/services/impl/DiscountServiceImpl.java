package app.sportcenter.services.impl;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.request.DiscountConfigRequest;
import app.sportcenter.models.dto.request.MonthDiscount;
import app.sportcenter.models.dto.response.DiscountConfigResponse;
import app.sportcenter.models.entities.DiscountConfig;
import app.sportcenter.repositories.DiscountConfigRepository;
import app.sportcenter.services.DiscountService;
import app.sportcenter.utils.mappers.DiscountConfigMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DiscountServiceImpl implements DiscountService {

    private final DiscountConfigRepository repository;
    private final DiscountConfigMapper mapper;

    @Override
    public List<DiscountConfigResponse> getAllActive() {
        return repository.getByIsActiveTrueAndIsDeletedFalse()
                .stream()
                .map(mapper::convertToResponse)
                .toList();
    }

    @Override
    public DiscountConfigResponse getById(String id) {
        DiscountConfig config = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Discount config not found"));
        return mapper.convertToResponse(config);
    }

    @Override
    public DiscountConfigResponse create(DiscountConfigRequest request) {
        Optional<DiscountConfig> existing = repository.findByTypeAndIsActiveTrueAndIsDeletedFalse(request.getType());
        if (existing.isPresent() && !Boolean.TRUE.equals(existing.get().getIsDeleted())) {
            throw new CustomException("Discount type already exists!", 400);
        }

        // chi 1 trong 2 null
        if ((request.getAmountDiscount() == null)
                && (request.getMonthDiscountList() == null || request.getMonthDiscountList().isEmpty())) {
            throw new CustomException("At least one of amountDiscountList or monthDiscountList must be provided", 400);
        }

        // check trung key
        validateNoDuplicateKeys(request);

        DiscountConfig config = mapper.convertToEntity(request);
        config.setIsActive(true);
        config.setIsDeleted(false);
        DiscountConfig saved = repository.save(config);
        return mapper.convertToResponse(saved);
    }

    @Override
    public DiscountConfigResponse updateById(String id, DiscountConfigRequest request) {
        DiscountConfig config = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Discount config not found"));

        if (!config.getType().equals(request.getType())) {
            boolean exists = repository.findByTypeAndIsActiveTrueAndIsDeletedFalse(request.getType())
                    .filter(dc -> !dc.getId().equals(id) && !Boolean.TRUE.equals(dc.getIsDeleted()))
                    .isPresent();
            if (exists) {
                throw new CustomException("Another config with the same type already exists!", 400);
            }
            config.setType(request.getType());
        }

        // chi 1 trong 2 duoc null
        if ((request.getAmountDiscount() == null)
                && (request.getMonthDiscountList() == null || request.getMonthDiscountList().isEmpty())) {
            throw new CustomException("At least one of amountDiscountList or monthDiscountList must be provided", 400);
        }

        // check trung key
        validateNoDuplicateKeys(request);

        config.setAmountDiscount(request.getAmountDiscount());
        config.setMonthDiscountList(request.getMonthDiscountList());

        DiscountConfig updated = repository.save(config);
        return mapper.convertToResponse(updated);
    }

    @Override
    public DiscountConfigResponse softDelete(String id) {
        DiscountConfig config = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Discount config not found"));

        config.setIsDeleted(true);
        config.setIsActive(false);

        return mapper.convertToResponse(repository.save(config));
    }

    @Override
    public DiscountConfigResponse restore(String id) {
        DiscountConfig config = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Discount config not found"));

        config.setIsDeleted(false);
        config.setIsActive(true);

        return mapper.convertToResponse(repository.save(config));
    }

    private void validateNoDuplicateKeys(DiscountConfigRequest request) {
        if (request.getMonthDiscountList() != null) {
            Set<Integer> months = new HashSet<>();
            for (MonthDiscount md : request.getMonthDiscountList()) {
                if (!months.add(md.getMonth())) {
                    throw new CustomException("Duplicate month found: " + md.getMonth(), 400);
                }
            }
        }
    }

}


