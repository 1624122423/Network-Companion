# NetworkCompanion — Incomplete and Planned Functionalities

Version: November 2025
This document outlines the functionalities that are either partially implemented or still under development.
While the platform’s basic user flow is functional, several advanced or supportive features remain incomplete.

## 1. User Account Enhancements (In Progress)
- Forgot Password / Reset Password — planned but not yet functional.
- Email Verification — email confirmation during sign-up not implemented.
- Notification via Email — no backend email system currently active.
- Error Handling and Validation — limited form validation and no user feedback on failed login/register.

## 2. Profile System (In Progress)
- Profile editing (e.g., name, gender, location) is still under testing.
- Interest selection for mentees during sign-up is not yet functional.
- Location and experience details for mentors are displayed statically but not stored in the database.
- Profile pictures are not supported.

## 3. Mentor Features (In Progress)
- Advanced Time Slot Management — mentors can add slots, but editing and deleting have limited validation.
- Location field for each time slot not displayed on mentee side.
- Booking conflict detection not yet implemented (two mentees can book the same slot).
- Mentor notifications when a booking occurs are not working yet.
- Mentor statistics or booking history not implemented.

## 4. Booking and Notification System (In Progress)
- No confirmation emails or system notifications for bookings.
- Rescheduling functionality missing (only cancel and rebook available).
- API integration for booking confirmation under debugging.
- No reminder messages before upcoming sessions.

## 5. Search and Recommendation System (In Progress)
- Search bar works partially, but lacks category-based filtering.
- Recommendation system logic is not connected to actual user data.
- Recommendations are currently static or mock data.

## 6. Dashboard Improvements (In Progress)
- Mentor popularity metrics and previous booking frequency are not displayed.
- Booking status indicators (confirmed / pending) not implemented.

## 7. Settings Page (In Progress)
- Preference settings (theme mode, notification options) are UI-only; backend not connected.
- Edit profile section not functional.
- Mentor availability color coding on calendar under development.

## 8. Planned Features (Future Work)
- AI-based Mentor Matching — personalized mentor recommendations based on profile similarity.
- Chatbot Prototype — suggest mentors through an interactive chat interface.
- Favorites System — mentors and mentees can save each other for quick access.
- Analytics Dashboard — track number of sessions, mentor ratings, and user engagement.

## 9. General Notes
This is the first release of NetworkCompanion.
Several core back-end services (email, search, recommendation, conflict detection) are not yet stable.
Most Front-end logic and routing are working, but integration testing and API stability require more time.
The team is currently focusing on improving the reliability of data flow between mentee and mentor accounts.
