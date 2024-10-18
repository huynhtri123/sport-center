package app.sportcenter.repositories;

import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.FieldType;
import app.sportcenter.models.entities.Field;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FieldRepository extends MongoRepository<Field, String> {

    // Lấy tất cả field đã bị xoá mềm
    public List<Field> getFieldByIsDeletedTrue();

    // Lấy tất cả field đang còn hoạt động (chưa bị xoá và trạng thái active)
    public List<Field> getFieldByIsDeletedFalseAndIsActiveTrue();

    // search by name, không phân biệt chữ hoa thường (tiếng việt có dấu)
    @Query("{ 'fieldName': { $regex: ?0, $options: 'i' }, 'isDeleted': false, 'isActive': true }")
    public List<Field> searchByFieldNameContainingIgnoreCase(String fieldName);

    // search by fieldType
    @Query("{ 'fieldType': ?0, 'isDeleted': false, 'isActive': true }")
    List<Field> findByFieldType(FieldType fieldType);

    // search by fieldStatus
    @Query("{ 'fieldStatus': ?0, 'isDeleted': false, 'isActive': true }")
    List<Field> findByFieldStatus(FieldStatus fieldStatus);

}
