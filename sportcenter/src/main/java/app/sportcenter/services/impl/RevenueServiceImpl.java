package app.sportcenter.services.impl;

import app.sportcenter.commons.RecurringIntervalType;
import app.sportcenter.models.entities.Booking;
import app.sportcenter.models.entities.RecurringBooking;
import app.sportcenter.repositories.BookingRepository;
import app.sportcenter.repositories.RecurringBookingRepository;
import app.sportcenter.services.RevenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RevenueServiceImpl implements RevenueService {

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private RecurringBookingRepository recurringBookingRepository;

    @Override
    public int countBookingByType(boolean isRecurring) {
        List<Booking> bookingListByType = bookingRepository.findByBookingType(isRecurring);
        return bookingListByType.isEmpty() ? 0 : bookingListByType.size();
    }

    @Override
    public int countRecurringBooking() {
        List<RecurringBooking> recurringBookings = recurringBookingRepository.findAll();
        return recurringBookings.isEmpty() ? 0 : recurringBookings.size();
    }

    @Override
    public int countRecurringByType(RecurringIntervalType type) {
        List<RecurringBooking> recurringBookings = recurringBookingRepository.findByRecurringBookingType(type);
        return recurringBookings.isEmpty() ? 0 : recurringBookings.size();
    }
}
