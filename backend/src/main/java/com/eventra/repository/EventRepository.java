package com.eventra.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventra.entity.Event;

public interface EventRepository extends JpaRepository<Event, Long> {
    boolean existsByVenueId(Long venueId);
}