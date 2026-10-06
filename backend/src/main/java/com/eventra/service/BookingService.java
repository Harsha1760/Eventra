
package com.eventra.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventra.dto.BookingRequest;
import com.eventra.entity.Booking;
import com.eventra.entity.BookingSeat;
import com.eventra.entity.Event;
import com.eventra.entity.Seat;
import com.eventra.entity.User;
import com.eventra.repository.BookingRepository;
import com.eventra.repository.BookingSeatRepository;
import com.eventra.repository.EventRepository;
import com.eventra.repository.SeatRepository;
import com.eventra.repository.UserRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;

    public BookingService(
            BookingRepository bookingRepository,
            BookingSeatRepository bookingSeatRepository,
            UserRepository userRepository,
            EventRepository eventRepository,
            SeatRepository seatRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.seatRepository = seatRepository;
    }

    // Get all bookings
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // Get booking history for a specific user
    public List<Booking> getBookingsByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        if (!userRepository.existsById(userId)) {
            throw new NoSuchElementException(
                    "User not found with ID: " + userId);
        }

        return bookingRepository.findByUserId(userId);
    }

    // Check whether a seat is currently booked for an event
    public boolean isSeatBooked(Long seatId, Long eventId) {
        if (seatId == null || eventId == null) {
            throw new IllegalArgumentException(
                    "Seat ID and event ID are required");
        }

        return bookingSeatRepository
                .existsBySeatIdAndBookingEventIdAndBookingStatus(
                        seatId, eventId, "CONFIRMED");
    }

    // Create a booking
    @Transactional
    public Booking createBooking(BookingRequest request) {

        // 1. Validate required fields
        if (request == null
                || request.getUserId() == null
                || request.getEventId() == null
                || request.getSeatIds() == null
                || request.getSeatIds().isEmpty()) {
            throw new IllegalArgumentException(
                    "User, event and at least one seat are required");
        }

        // 2. Validate seat IDs
        Set<Long> uniqueSeatIds = new HashSet<>(request.getSeatIds());

        if (uniqueSeatIds.size() != request.getSeatIds().size()
                || uniqueSeatIds.contains(null)) {
            throw new IllegalArgumentException(
                    "Seat selection contains duplicate or invalid IDs");
        }

        // 3. Find user and event
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NoSuchElementException(
                        "User not found with ID: " + request.getUserId()));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new NoSuchElementException(
                        "Event not found with ID: " + request.getEventId()));

        if (event.getVenue() == null) {
            throw new IllegalStateException(
                    "Event does not have a venue");
        }

        // 4. Find all requested seats
        List<Seat> seats = seatRepository.findAllById(uniqueSeatIds);

        if (seats.size() != uniqueSeatIds.size()) {
            throw new NoSuchElementException(
                    "One or more selected seats do not exist");
        }

        // 5. Validate seats and calculate total amount
        double totalAmount = 0.0;

        for (Seat seat : seats) {

            if (seat.getVenue() == null
                    || !seat.getVenue().getId()
                            .equals(event.getVenue().getId())) {
                throw new IllegalArgumentException(
                        "Seat " + seat.getSeatNumber()
                                + " does not belong to this event's venue");
            }

            if (seat.getPrice() == null || seat.getPrice() < 0) {
                throw new IllegalStateException(
                        "Seat " + seat.getSeatNumber()
                                + " has an invalid price");
            }

            boolean alreadyBooked = bookingSeatRepository
                    .existsBySeatIdAndBookingEventIdAndBookingStatus(
                            seat.getId(), event.getId(), "CONFIRMED");

            if (alreadyBooked) {
                throw new IllegalStateException(
                        "Seat " + seat.getSeatNumber()
                                + " is already booked for this event");
            }

            totalAmount += seat.getPrice();
        }

        // 6. Create and save the booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setBookingDate(LocalDateTime.now());
        booking.setTotalAmount(totalAmount);
        booking.setStatus("CONFIRMED");

        Booking savedBooking = bookingRepository.save(booking);

        // 7. Save the seat associations
        List<BookingSeat> bookingSeats = new ArrayList<>();

        for (Seat seat : seats) {
            BookingSeat bookingSeat = new BookingSeat();
            bookingSeat.setBooking(savedBooking);
            bookingSeat.setSeat(seat);

            bookingSeats.add(bookingSeat);
        }

        bookingSeatRepository.saveAll(bookingSeats);

        return savedBooking;
    }

    // Cancel a confirmed booking
    @Transactional
    public Booking cancelBooking(Long bookingId) {

        if (bookingId == null) {
            throw new IllegalArgumentException(
                    "Booking ID is required");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Booking not found with ID: " + bookingId));

        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new IllegalStateException(
                    "Only confirmed bookings can be cancelled");
        }

        booking.setStatus("CANCELLED");

        return bookingRepository.save(booking);
    }
}