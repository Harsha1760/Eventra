package com.eventra.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.eventra.entity.BookingSeat;

public interface BookingSeatRepository
        extends JpaRepository<BookingSeat, Long> {

    boolean existsBySeatIdAndBookingEventIdAndBookingStatus(
            Long seatId,
            Long eventId,
            String status);

    boolean existsBySeatIdAndBookingEventId(
            Long seatId,
            Long eventId);

    boolean existsBySeatId(Long seatId);
}