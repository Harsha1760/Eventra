
package com.eventra.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.eventra.dto.BookingRequest;
import com.eventra.entity.Booking;
import com.eventra.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(
            @RequestBody BookingRequest request) {

        Booking booking = bookingService.createBooking(request);

        return new BookingResponse(
                booking.getId(),
                booking.getUser().getId(),
                booking.getEvent().getId(),
                booking.getBookingDate(),
                booking.getTotalAmount(),
                booking.getStatus(),
                request.getSeatIds()
        );
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/seat-check")
    public boolean isSeatBooked(
            @RequestParam Long seatId,
            @RequestParam Long eventId) {

        return bookingService.isSeatBooked(seatId, eventId);
    }

    public record BookingResponse(
            Long bookingId,
            Long userId,
            Long eventId,
            LocalDateTime bookingDate,
            Double totalAmount,
            String status,
            List<Long> seatIds
    ) {}
}