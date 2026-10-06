package com.eventra.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventra.entity.BookingSeat;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

    boolean existsBySeatIdAndBookingEventId(Long seatId, Long eventId);
}