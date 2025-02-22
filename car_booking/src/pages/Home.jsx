import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Navbar from '../layouts/Navbar';
import Sidebar from '../layouts/Sidebar';
import BookingModal from '../components/BookingModal';
import '../pages/big_calendar.css'; // Ensure this file exists and is correct

const Home = ({ authenticated, toggleAuth, setAuthenticated }) => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [warning, setWarning] = useState(''); // State for warning message

  // Fetch bank holidays from the API
  useEffect(() => {
    const fetchBankHolidays = async () => {
      try {
        const response = await fetch('https://www.gov.uk/bank-holidays.json');
        const data = await response.json();
        const englandAndWalesEvents = data['england-and-wales'].events;

        // Map API events to the calendar event format
        const bankHolidays = englandAndWalesEvents.map((event) => ({
          id: `holiday-${event.date}`, // Unique ID for holidays
          title: event.title,
          start: event.date,
          end: event.date,
          allDay: true, // Bank holidays are all-day events
          type: 'holiday', // Add a type to differentiate
        }));

        // Deduplicate new events with existing events
        setEvents((prevEvents) => {
          const uniqueEvents = bankHolidays.filter(
            (newEvent) => !prevEvents.some((existingEvent) => existingEvent.id === newEvent.id)
          );
          return [...prevEvents, ...uniqueEvents]; // Add only unique events
        });
      } catch (error) {
        console.error('Error fetching bank holidays:', error);
        setWarning('Failed to fetch bank holidays. Please try again later.');
      }
    };

    fetchBankHolidays();
  }, []);

  // Fetch seed data for bookings
  useEffect(() => {
    const fetchSeedData = async () => {
      try {
        const response = await fetch('http://localhost:5028/api/Bookings/SeedData');
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error:', errorText);
          throw new Error('Failed to fetch seed data');
        }
        const data = await response.json();
        console.log('Seed data:', data);
    
        // Map seed data to the calendar event format
        const formattedSeedData = data.map((booking) => ({
          id: crypto.randomUUID(), // Generate a unique ID if the API doesn't provide one
          title: booking.carModel || 'No Car Model', // Handle nullable carModel
          start: new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day),
          end: new Date(booking.bookingDate.year, booking.bookingDate.month - 1, booking.bookingDate.day),
          allDay: false,
          type: 'booking',
        }));
    
        // Add the formatted seed data to the events state
        setEvents((prevEvents) => [...prevEvents, ...formattedSeedData]);
      } catch (error) {
        console.error('Error fetching seed data:', error);
        setWarning('Failed to fetch seed data. Please try again later.');
      }
    };

    fetchSeedData();
  }, []);

  // Handle adding events from the modal
  const handleAddEvent = async (event) => {
    const { title, start, end, repeatOption, repeatDays, selectedCar } = event;
  
    // Generate events based on repeat option
    const newEvents = [];
    if (repeatOption === 'Weekly' && repeatDays.length > 0) {
      // Calculate events for the same day of the week for the rest of the month
      const startDate = new Date(start);
      const endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + 1); // Repeat for the next month
  
      repeatDays.forEach((day) => {
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          if (currentDate.getDay() === ['Su', 'Mo', 'Tu', 'Wd', 'Th', 'Fr', 'Sa'].indexOf(day)) {
            const eventStart = new Date(currentDate);
            eventStart.setHours(start.getHours(), start.getMinutes(), 0, 0);
  
            const eventEnd = new Date(currentDate);
            eventEnd.setHours(end.getHours(), end.getMinutes(), 0, 0);
  
            newEvents.push({
              id: `booking-${eventStart.toISOString()}`, // Unique ID for bookings
              title: `${title} (${selectedCar})`, // Include car in the title
              start: eventStart,
              end: eventEnd,
              allDay: false, // Bookings are not all-day events
              type: 'booking', // Add a type to differentiate
              selectedCar,
              repeatOption,
              repeatDays,
            });
          }
          currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
        }
      });
    } else {
      // Single event (no repeat)
      newEvents.push({
        id: `booking-${start.toISOString()}`, // Unique ID for bookings
        title: `${title} (${selectedCar})`, // Include car in the title
        start,
        end,
        allDay: false, // Bookings are not all-day events
        type: 'booking', // Add a type to differentiate
        selectedCar,
        repeatOption,
        repeatDays,
      });
    }
  
    // Add new events to the calendar
    setEvents((prevEvents) => {
      const uniqueEvents = newEvents.filter(
        (newEvent) => !prevEvents.some((existingEvent) => existingEvent.id === newEvent.id)
      );
      return [...prevEvents, ...uniqueEvents]; // Add only unique events
    });
  
    // Create a new booking using the API
    try {
      const response = await fetch('http://localhost:5028/api/Bookings/Booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication token if required
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          id: newEvents[0].id, // Use the first event's ID
          bookingDate: {
            year: start.getFullYear(),
            month: start.getMonth() + 1,
            day: start.getDate(),
            dayOfWeek: start.getDay(),
          },
          startTime: {
            ticks: start.getTime(), // Convert to ticks (milliseconds since epoch)
          },
          endTime: {
            ticks: end.getTime(),
          },
          repeatOption: repeatOption === 'Weekly' ? 1 : 2, // Map to valid enum values
          endRepeatDate: {
            year: end.getFullYear(),
            month: end.getMonth() + 1,
            day: end.getDate(),
            dayOfWeek: end.getDay(),
          },
          daysToRepeatOn: repeatDays.reduce((acc, day) => acc + (1 << ['Su', 'Mo', 'Tu', 'Wd', 'Th', 'Fr', 'Sa'].indexOf(day)),
          0), // Map to valid enum values
          requestedOn: new Date().toISOString(),
          carId: 'some-uuid', // Replace with actual UUID for the selected car
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error('Failed to create booking');
      }
  
      const data = await response.json();
      console.log('Booking created:', data);
    } catch (error) {
      console.error('Error creating booking:', error);
      setWarning('Failed to create booking. Please try again.');
    }
  
    setShowModal(false);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Show warning if user is not authenticated
  useEffect(() => {
    if (showModal && !authenticated) {
      setWarning('Please login first!');
    } else {
      setWarning(''); // Clear warning if authenticated
    }
  }, [showModal, authenticated]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setShowModal={setShowModal}
        closeSidebar={closeSidebar}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          authenticated={authenticated}
          setAuthenticated={setAuthenticated}
          setShowModal={setShowModal}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Warning Message */}
        {warning && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
            {warning}
          </div>
        )}

        {/* Calendar */}
        <div className="p-4 flex-1 overflow-y-auto">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            height="auto"
          />
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && authenticated && (
        <BookingModal onClose={() => setShowModal(false)} onAddEvent={handleAddEvent} />
      )}
    </div>
  );
};

export default Home;