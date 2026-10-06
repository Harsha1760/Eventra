package com.eventra.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventra.entity.Seat;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    boolean existsById(Long id);
}