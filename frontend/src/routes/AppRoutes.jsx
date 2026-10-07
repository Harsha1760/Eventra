import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { TheatreLayout } from '../layouts/TheatreLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Route Guards
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { EventsPage } from '../pages/public/EventsPage';
import { EventDetailsPage } from '../pages/public/EventDetailsPage';
import { VenuesPage } from '../pages/public/VenuesPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

// Authenticated User Pages
import { SeatSelectionPage } from '../pages/user/SeatSelectionPage';
import { BookingConfirmationPage } from '../pages/user/BookingConfirmationPage';
import { MyBookingsPage } from '../pages/user/MyBookingsPage';
import { ProfilePage } from '../pages/user/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { ManageEventsPage } from '../pages/admin/ManageEventsPage';
import { ManageVenuesPage } from '../pages/admin/ManageVenuesPage';
import { ManageSeatsPage } from '../pages/admin/ManageSeatsPage';
import { ManageBookingsPage } from '../pages/admin/ManageBookingsPage';
import { ManageUsersPage } from '../pages/admin/ManageUsersPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* 1. Normal Editorial Mode (Public & User Pages) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailsPage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected User Routes in Editorial Layout */}
        <Route
          path="/bookings/:id/confirmation"
          element={
            <ProtectedRoute>
              <BookingConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 2. Theatre Mode (Dedicated Cinematic Seat Selection Layout) */}
      <Route element={<TheatreLayout />}>
        <Route path="/events/:id/book" element={<SeatSelectionPage />} />
      </Route>

      {/* 3. Admin Control Portal (AdminLayout guarded by AdminRoute) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="events" element={<ManageEventsPage />} />
        <Route path="venues" element={<ManageVenuesPage />} />
        <Route path="seats" element={<ManageSeatsPage />} />
        <Route path="bookings" element={<ManageBookingsPage />} />
        <Route path="users" element={<ManageUsersPage />} />
      </Route>
    </Routes>
  );
}

