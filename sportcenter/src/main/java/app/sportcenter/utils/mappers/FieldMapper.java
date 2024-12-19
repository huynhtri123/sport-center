package app.sportcenter.utils.mappers;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.FieldRequest;
import app.sportcenter.models.dto.FieldResponse;
import app.sportcenter.models.entities.Field;
import app.sportcenter.models.entities.PricePolicy;
import app.sportcenter.models.entities.Sport;
import app.sportcenter.repositories.SportRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FieldMapper {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private PricePolicyMapper pricePolicyMapper;
    @Autowired
    private SportRepository sportRepository;

    public Field convertToEntity(FieldRequest fieldRequest) {
        if (fieldRequest == null) {
            throw new CustomException("FieldRequest is null!", HttpStatus.BAD_REQUEST.value());
        }

        Field field = modelMapper.map(fieldRequest, Field.class);

        Sport sport = sportRepository.findById(fieldRequest.getSportId())
                .orElseThrow(() -> new CustomException("Sport not found with id: " + fieldRequest.getSportId(), HttpStatus.NOT_FOUND.value()));
        field.setSport(sport);

        List<PricePolicy> pricePolicyEntity = fieldRequest.getPricePolicies().stream()
                .map(pricePolicyMapper::convertToEntity)
                .toList();
        field.setPricePolicies(pricePolicyEntity);

        return field;
    }

    public FieldResponse convertToDTO(Field field) {
        if (field == null) {
            throw new CustomException("Field is null!", HttpStatus.BAD_REQUEST.value());
        }

        FieldResponse response = modelMapper.map(field, FieldResponse.class);

        response.setSportId(field.getSport().getId());

        response.setPricePolicies(field.getPricePolicies().stream()
                .map(pricePolicyMapper::convertToRespone)
                .toList());

        return response;
    }

    // Ghi đè field mới lên field cũ
    public Field replaceAll(Field oldField, FieldRequest newField) {
        if (newField == null) {
            throw new CustomException("New Field is null!", HttpStatus.BAD_REQUEST.value());
        }
        if (oldField == null) {
            throw new CustomException("Old Field is null!", HttpStatus.BAD_REQUEST.value());
        }

        oldField.setFieldName(newField.getFieldName());
        oldField.setDescription(newField.getDescription());
        oldField.setImageUrl(newField.getImageUrl());
        oldField.setVideoUrl(newField.getVideoUrl());

        Sport sport = sportRepository.findById(newField.getSportId())
                .orElseThrow(() -> new CustomException("Sport not found with id: " + newField.getSportId(), HttpStatus.NOT_FOUND.value()));
        oldField.setSport(sport);

        List<PricePolicy> pricePolicyEntity = newField.getPricePolicies().stream()
                .map(pricePolicyMapper::convertToEntity)
                .toList();
        oldField.setPricePolicies(pricePolicyEntity);

        return oldField;
    }
}
