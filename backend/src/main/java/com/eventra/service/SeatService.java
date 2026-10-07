package com.eventra.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.eventra.entity.Seat;
import com.eventra.entity.Venue;
import com.eventra.repository.BookingSeatRepository;
import com.eventra.repository.SeatRepository;
import com.eventra.repository.VenueRepository;

@Service
public class SeatService {

    private final SeatRepository seatRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final VenueRepository venueRepository;

    public SeatService(
            SeatRepository seatRepository,
            BookingSeatRepository bookingSeatRepository,
            VenueRepository venueRepository) {
        this.seatRepository = seatRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.venueRepository = venueRepository;
    }

    public Seat createSeat(Seat seat) {
        if (seat.getVenue() == null || seat.getVenue().getId() == null) {
            throw new IllegalArgumentException("Seat must have a valid venue");
        }

        Venue venue = venueRepository.findById(seat.getVenue().getId())
                .orElseThrow(() -> new NoSuchElementException(
                        "Venue not found with ID: " + seat.getVenue().getId()));
        seat.setVenue(venue);

        return seatRepository.save(seat);
    }

    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    public Seat getSeatById(Long id) {
        return seatRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(
                        "Seat not found with ID: " + id));
    }

    public Seat updateSeat(Long id, Seat updatedSeat) {
        Seat existingSeat = getSeatById(id);

        if (updatedSeat.getVenue() != null && updatedSeat.getVenue().getId() != null) {
            Venue venue = venueRepository.findById(updatedSeat.getVenue().getId())
                    .orElseThrow(() -> new NoSuchElementException(
                            "Venue not found with ID: " + updatedSeat.getVenue().getId()));
            existingSeat.setVenue(venue);
        }

        existingSeat.setSeatNumber(updatedSeat.getSeatNumber());
        existingSeat.setSection(updatedSeat.getSection());
        existingSeat.setSeatType(updatedSeat.getSeatType());
        existingSeat.setPrice(updatedSeat.getPrice());

        return seatRepository.save(existingSeat);
    }

    public void deleteSeat(Long id) {
        Seat seat = getSeatById(id);

        if (bookingSeatRepository.existsBySeatId(id)) {
            throw new IllegalStateException(
                    "Cannot delete a seat referenced by booking records");
        }

        seatRepository.delete(seat);
    }
}