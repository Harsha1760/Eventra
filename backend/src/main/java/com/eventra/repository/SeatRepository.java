package com.eventra.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventra.entity.Seat;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    boolean existsById(Long id);

    List<Seat> findByVenueId(Long venueId);

    List<Seat> findByVenueIdAndSeatNumberIn(Long venueId, Collection<String> seatNumbers);
}