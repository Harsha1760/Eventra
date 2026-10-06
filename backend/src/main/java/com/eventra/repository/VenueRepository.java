package com.eventra.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventra.entity.Venue;

public interface VenueRepository extends JpaRepository<Venue, Long> {
}