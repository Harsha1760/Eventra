
package com.eventra.service;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.eventra.entity.Event;
import com.eventra.repository.EventRepository;
import com.eventra.repository.BookingRepository;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    public EventService(
            EventRepository eventRepository,
            BookingRepository bookingRepository) {
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
    }

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(
                        "Event not found with ID: " + id));
    }

    public Event updateEvent(Long id, Event updatedEvent) {
        Event existingEvent = getEventById(id);

        existingEvent.setName(updatedEvent.getName());
        existingEvent.setDescription(updatedEvent.getDescription());
        existingEvent.setArtist(updatedEvent.getArtist());
        existingEvent.setCategory(updatedEvent.getCategory());
        existingEvent.setEventDate(updatedEvent.getEventDate());
        existingEvent.setStartTime(updatedEvent.getStartTime());
        existingEvent.setEndTime(updatedEvent.getEndTime());
        existingEvent.setStatus(updatedEvent.getStatus());
        existingEvent.setVenue(updatedEvent.getVenue());

        return eventRepository.save(existingEvent);
    }

    public void deleteEvent(Long id) {
        Event event = getEventById(id);

        if (bookingRepository.existsByEventId(id)) {
            throw new IllegalStateException(
                    "Cannot delete an event that has booking history");
        }

        eventRepository.delete(event);
    }
}