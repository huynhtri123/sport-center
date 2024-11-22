package app.sportcenter.repositories;

import app.sportcenter.models.entities.Sport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SportRepository extends MongoRepository<Sport, String> {
    public Sport getSportById(String id);
    public List<Sport> getByIsDeletedTrue();
    public List<Sport> getByIsDeletedFalse();
    public List<Sport> getSportByIsActiveTrueAndIsDeletedFalse();
    Page<Sport> findByIsActiveTrueAndIsDeletedFalse(Pageable pageable);
    @Query("{ 'isDeleted': false, 'isActive': true }")
    Page<Sport> findAllActive(Pageable pageable);


    Page<Sport> findByIsDeletedFalseAndIsActiveTrue(Pageable pageable);
}
