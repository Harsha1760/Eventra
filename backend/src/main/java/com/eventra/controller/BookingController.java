package com.eventra.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.eventra.dto.BookingRequest;
import com.eventra.dto.BookingResponse;
import com.eventra.security.UserPrincipal;
import com.eventra.service.BookingService;

import jakarta.validation.Valid;

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
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return bookingService.createBooking(request, principal);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/{bookingId}/cancel")
    public BookingResponse cancelBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return bookingService.cancelBooking(bookingId, principal);
    }

    @GetMapping("/seat-check")
    public boolean isSeatBooked(
            @RequestParam Long seatId,
            @RequestParam Long eventId) {
        return bookingService.isSeatBooked(seatId, eventId);
    }

    @GetMapping("/user/{userId}")
    public List<BookingResponse> getBookingsByUserId(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return bookingService.getBookingsByUserId(userId, principal);
    }
}