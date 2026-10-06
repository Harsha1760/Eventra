package com.eventra.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventra.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    boolean existsByEventId(Long eventId);

    boolean existsByUserId(Long userId);
}