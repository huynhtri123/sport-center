package app.sportcenter.utils.mappers;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.FieldRequest;
import app.sportcenter.models.dto.FieldResponse;
import app.sportcenter.models.entities.Field;
import app.sportcenter.models.entities.PricePolicy;
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

    public Field convertToEntity(FieldRequest fieldRequest) {
        return fieldRequest != null ? modelMapper.map(fieldRequest, Field.class) : null;
    }

    public FieldResponse convertToDTO(Field field) {
        return field != null ? modelMapper.map(field, FieldResponse.class) : null;
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
        oldField.setFieldType(newField.getFieldType());
        oldField.setDescription(newField.getDescription());

        List<PricePolicy> pricePolicyEntity = newField.getPricePolicies().stream()
                        .map(pricePolicyMapper::convertToEntity).toList();
        oldField.setPricePolicies(pricePolicyEntity);
        oldField.setImageUrl(newField.getImageUrl());
        oldField.setVideoUrl(newField.getVideoUrl());

        return oldField;
    }
}
