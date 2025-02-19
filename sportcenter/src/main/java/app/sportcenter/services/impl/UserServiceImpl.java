package app.sportcenter.services.impl;

import app.sportcenter.commons.*;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.request.PaymentRequest;
import app.sportcenter.models.dto.request.UserRequest;
import app.sportcenter.models.dto.response.InvoiceResponse;
import app.sportcenter.models.dto.response.PaymentResponse;
import app.sportcenter.models.dto.response.UserResponse;
import app.sportcenter.models.entities.Invoice;
import app.sportcenter.models.entities.PaymentInfo;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.InvoiceRepository;
import app.sportcenter.repositories.PaymentInfoRepository;
import app.sportcenter.repositories.UserRepository;
import app.sportcenter.services.UserService;
import app.sportcenter.utils.mappers.InvoiceMapper;
import app.sportcenter.utils.mappers.UserMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final InvoiceMapper invoiceMapper;
    private final InvoiceRepository invoiceRepository;
    private final PaymentInfoRepository paymentInfoRepository;

    @Override
    public UserDetailsService userDetailsService() {
        return new UserDetailsService() {
            @Override
            public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                return userRepository.getUserByEmail(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found!"));
            }
        };
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.getUserByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
    }

    @Override
    public ResponseEntity<BaseResponse> updateInfoCurrentUser(UserRequest userRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        if (userRequest == null) {
            throw new CustomException("User input is null", HttpStatus.BAD_REQUEST.value());
        }
        currentUser.setFullName(userRequest.getFullName());
        currentUser.setPhoneNumber(userRequest.getPhoneNumber());
        currentUser.setAddress(userRequest.getAddress());
        currentUser.setDateOfBirth(userRequest.getDateOfBirth());
        currentUser.setAvatarUrl(userRequest.getAvatarUrl());
        User updatedUser = userRepository.save(currentUser);

        UserResponse responseUser = userMapper.convertToDTO(currentUser);
        return ResponseEntity.ok(
                new BaseResponse("Update profile successfully!", HttpStatus.OK.value(), responseUser)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getCurrentProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new NotFoundException("User currently logged in not found!");
        }

        UserResponse responseUser = userMapper.convertToDTO(currentUser);
        return ResponseEntity.ok(
                new BaseResponse("Found information about the current user", HttpStatus.OK.value(), responseUser)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAccountBalance() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Double accountBalance = currentUser.getAccountBalance();

        return ResponseEntity.ok(
                new BaseResponse("Retrieved current balance successfully", HttpStatus.OK.value(), accountBalance)
        );
    }

    @Override
    public InvoiceResponse makePaymentByBalance(Double amountToPay, String transactionType) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Double accountBalance = currentUser.getAccountBalance();
        if (accountBalance < amountToPay) {
            throw new CustomException("Failed. Insufficient balance to complete the payment!", HttpStatus.BAD_REQUEST.value());
        }

        currentUser.setAccountBalance(accountBalance - amountToPay);
        userRepository.save(currentUser);

        Invoice invoice = new Invoice();
        invoice.setUser(currentUser);
        invoice.setAmount(amountToPay);
        invoice.setPaymentMethod(PaymentMethod.ACCOUNT_BALANCE);
        invoice.setPaymentStatus(PaymentStatus.PAID);
        invoice.setTransactionType(TransactionType.valueOf(transactionType));
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return invoiceMapper.convertToResponse(savedInvoice);
    }

    @Transactional
    @Override
    public boolean refund(User owner, Double price) {
        try {
            // Kiểm tra đầu vào
            if (owner == null) {
                log.error("Owner not found (null).");
                return false;
            }
            if (price == null || price < 0) {
                log.error("Refund amount not found: {}", price);
                return false;
            }

            // Cập nhật số dư
            Double currentBalance = owner.getAccountBalance();
            if (currentBalance == null) {
                log.error("Account balance of current user {} null.", owner.getFullName());
                return false;
            }

            owner.setAccountBalance(currentBalance + price);
            userRepository.save(owner);
            log.warn("Refunded {} amount {}", owner.getFullName(), price);

            return true;
        } catch (Exception ex) {
            log.error("Error while refund for {} amount {}: {}",
                    owner != null ? owner.getFullName() : "null",
                    price,
                    ex.getMessage(),
                    ex);
            return false;
        }
    }

    @Override
    public UserResponse getCurrentUser(HttpServletRequest request) {
        String jwt = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    break;
                }
            }
        }
        if (jwt == null) {
            throw new CustomException("No users are currently logged in", 404);
        } else {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currUser = (User) authentication.getPrincipal();
            return userMapper.convertToDTO(currUser);
        }
    }

    @Override
    public UserResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User cannot found with id=" + userId));
        return userMapper.convertToDTO(user);
    }

    @Override
    public List<UserResponse> getAllActive() {
        return userRepository.findAllByIsActiveTrueAndIsDeletedFalse()
                .stream().map(userMapper::convertToDTO).toList();
    }

    @Override
    public ResponseEntity<BaseResponse> getAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage = userRepository.findByIsDeletedFalseAndIsActiveTrue(pageable);

        if (userPage.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("No users found", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        List<UserResponse> userResponseList = userPage.getContent()
                .stream()
                .map(userMapper::convertToDTO)
                .toList();

        PaginatedResponse<UserResponse> paginatedResponse = new PaginatedResponse<>(
                userResponseList,
                userPage.getTotalPages(),
                userPage.getTotalElements()
        );

        return ResponseEntity.ok(
                new BaseResponse(
                        "User list retrieved successfully",
                        HttpStatus.OK.value(),
                        paginatedResponse
                )
        );
    }

    @Override
    public ResponseEntity<BaseResponse> softDelete(String id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("No user found to delete", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        user.setIsDeleted(true);
        userRepository.save(user);

        UserResponse responseUser = userMapper.convertToDTO(user);

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("User deleted successfully", HttpStatus.OK.value(), responseUser)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> addPaymentInfoToUser(String userId, PaymentRequest paymentRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Kiểm tra số thẻ
        String cardNumber = paymentRequest.getCardNumber();
        if (!isValidCardNumber(cardNumber)) {
            return ResponseEntity.badRequest().body(
                    new BaseResponse("Invalid card number. Please enter again (10 to 16 digits)", HttpStatus.BAD_REQUEST.value(), null)
            );
        }

        // Tạo mới đối tượng PaymentInfo và thiết lập các thuộc tính
        PaymentInfo paymentInfo = new PaymentInfo();
        paymentInfo.setBankName(paymentRequest.getBankName());
        paymentInfo.setCardNumber(cardNumber);
        paymentInfo.setCardHolderName(paymentRequest.getCardHolderName());
        paymentInfo.setIssueDate(paymentRequest.getIssueDate());
        paymentInfo.setUserId(userId); // Lưu ID của user vào paymentInfo

        if (user.getPaymentInfos() == null) {
            user.setPaymentInfos(new ArrayList<>()); // Khởi tạo danh sách mới nếu cần
        }

        // Lưu PaymentInfo vào cơ sở dữ liệu
        user.getPaymentInfos().add(paymentInfo);
        paymentInfoRepository.save(paymentInfo);
        userRepository.save(user);

        // Tạo PaymentResponse để trả về
        PaymentResponse paymentResponse = new PaymentResponse(
                paymentInfo.getBankName(),
                paymentInfo.getCardNumber(),
                paymentInfo.getCardHolderName(),
                paymentInfo.getIssueDate(),
                userId
        );

        // Trả về response
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Payment method added successfully", HttpStatus.OK.value(), paymentResponse)
        );
    }

    // Phương thức kiểm tra số thẻ
    private boolean isValidCardNumber(String cardNumber) {
        // Biểu thức chính quy để kiểm tra thẻ từ 10 đến 16 chữ số
        return cardNumber != null && cardNumber.matches("^\\d{10,16}$");
    }

    @Override
    public ResponseEntity<BaseResponse> removePaymentInfoFromUser(String userId, String paymentInfoId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        PaymentInfo paymentInfo = paymentInfoRepository.findById(paymentInfoId)
                .orElseThrow(() -> new RuntimeException("Payment information not found with ID: " + paymentInfoId));

        user.getPaymentInfos().remove(paymentInfo);

        userRepository.save(user);
        paymentInfoRepository.delete(paymentInfo);

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Payment information deleted successfully", HttpStatus.OK.value(), null)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> updatePaymentInfoForUser(String userId, String paymentInfoId, PaymentRequest paymentRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        PaymentInfo paymentInfo = paymentInfoRepository.findById(paymentInfoId)
                .orElseThrow(() -> new RuntimeException("Payment information not found with ID: " + paymentInfoId));

        paymentInfo.setBankName(paymentRequest.getBankName());
        paymentInfo.setCardNumber(paymentRequest.getCardNumber());
        paymentInfo.setCardHolderName(paymentRequest.getCardHolderName());
        paymentInfo.setIssueDate(paymentRequest.getIssueDate());

        paymentInfoRepository.save(paymentInfo);

        PaymentResponse paymentResponse = new PaymentResponse(
                paymentInfo.getBankName(),
                paymentInfo.getCardNumber(),
                paymentInfo.getCardHolderName(),
                paymentInfo.getIssueDate(),
                userId
        );

        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Payment information updated successfully", HttpStatus.OK.value(), paymentResponse)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getInvoicesForCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        if (currentUser == null) {
            throw new NotFoundException("User currently logged in not found!");
        }

        // Fetch invoices associated with the current user
        List<Invoice> invoices = invoiceRepository.findByUserIdAndIsActiveTrueAndIsDeletedFalse(currentUser.getId());

        if (invoices.isEmpty()) {
            return ResponseEntity.ok(
                    new BaseResponse("No invoices found for the current user", HttpStatus.OK.value(), new ArrayList<>())
            );
        }

        List<InvoiceResponse> response = invoices.stream()
                .map(invoiceMapper::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                new BaseResponse("Found invoices for the current user", HttpStatus.OK.value(), response)
        );
    }

    @Override
    @Transactional
    public ResponseEntity<BaseResponse> deleteInvoice(String invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new NotFoundException("Invoice with ID " + invoiceId + " not found"));

        invoiceRepository.delete(invoice);

        return ResponseEntity.ok(
                new BaseResponse("Invoice deleted successfully", HttpStatus.OK.value(), null)
        );
    }

}
