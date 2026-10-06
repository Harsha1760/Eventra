
package com.eventra.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.eventra.entity.Seat;
import com.eventra.repository.SeatRepository;
import com.eventra.repository.BookingSeatRepository;

@Service
public class SeatService {

    private final SeatRepository seatRepository;
    private final BookingSeatRepository bookingSeatRepository;

    public SeatService(
            SeatRepository seatRepository,
            BookingSeatRepository bookingSeatRepository) {
        this.seatRepository = seatRepository;
        this.bookingSeatRepository = bookingSeatRepository;
    }

    public Seat createSeat(Seat seat) {
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

        existingSeat.setSeatNumber(updatedSeat.getSeatNumber());
        existingSeat.setSection(updatedSeat.getSection());
        existingSeat.setSeatType(updatedSeat.getSeatType());
        existingSeat.setPrice(updatedSeat.getPrice());
        existingSeat.setVenue(updatedSeat.getVenue());

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