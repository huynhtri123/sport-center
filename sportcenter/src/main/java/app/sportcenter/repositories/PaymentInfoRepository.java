package app.sportcenter.repositories;

import app.sportcenter.models.entities.PaymentInfo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentInfoRepository extends MongoRepository<PaymentInfo, String> {
    // Bạn có thể thêm các phương thức tùy chỉnh tại đây nếu cần
}
