package app.sportcenter.services;

import app.sportcenter.commons.RecurringIntervalType;

public interface RevenueService {
    // đếm số lượng booking theo isRecurring (dùng cho đếm số booking lẻ)
    public int countBookingByType(boolean isRecurring);
    public int countRecurringBooking();

    // đếm số lượng recurring theo chu kì (ví dụ: đếm xem có bao nhiêu booking đặt theo kiểu WEEKLY, DAILY)
    public int countRecurringByType(RecurringIntervalType type);
}
