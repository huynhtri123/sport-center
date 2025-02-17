package app.sportcenter.repositories;

import app.sportcenter.models.entities.Invoice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    List<Invoice> findByIsActiveTrueAndIsDeletedFalse();

    @Query("{'user.id': ?0, 'isActive': true, 'isDeleted': false}")
    List<Invoice> findByUserIdAndIsActiveTrueAndIsDeletedFalse(String userId);



}
