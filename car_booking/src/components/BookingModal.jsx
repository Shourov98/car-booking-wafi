import React, { useState } from 'react';

const BookingModal = ({ onClose, onAddEvent }) => {

  // State variables for form fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [repeatOption, setRepeatOption] = useState('Weekly');
  const [repeatDays, setRepeatDays] = useState([]);
  const [selectedCar, setSelectedCar] = useState('');
  const [warning, setWarning] = useState(''); // State for warning message

  // Example array of car options
  const carOptions = [
    'Toyota',
    'Honda',
    'Ford',
    'Tesla',
    'BMW',
    'Audi',
  ];

  const handleSave = async () => {
    const now = new Date(); // Current time
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
  
    // Check if start time is in the past
    if (start < now) {
      setWarning('Start time must be in the future.');
      return;
    }
  
    // Check if end time is before start time
    if (end <= start) {
      setWarning('End time must be after start time.');
      return;
    }
  
    setWarning(''); // Clear the warning message
  
    // Prepare the booking data for the API
    const bookingData = {
      id: crypto.randomUUID(), // Generate a unique ID
      bookingDate: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`, // Format as "yyyy-MM-dd"
      startTime: start.toISOString().split('T')[1].split('.')[0], // Format as "HH:mm:ss"
      endTime: end.toISOString().split('T')[1].split('.')[0], // Format as "HH:mm:ss"
      repeatOption: repeatOption === 'Weekly' ? 2 : 1, 
      endRepeatDate: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`, // Format as "yyyy-MM-dd"
      daysToRepeatOn: repeatDays.reduce(
        (acc, day) => acc + (1 << ['Su', 'Mo', 'Tu', 'Wd', 'Th', 'Fr', 'Sa'].indexOf(day)),
        0 // Initial value for the accumulator
      ),
      requestedOn: new Date().toISOString(), // Format as ISO date-time string
      carId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', // Replace with actual UUID for the selected car
    };
  
    try {
      // Log the request URL and payload
      console.log('Request URL:', 'http://localhost:5028/api/Bookings/Booking');
      console.log('Request Payload:', bookingData);
  
      // Send the booking data to the API
      // Here is some issues that I can't solve
      const response = await fetch('http://localhost:5028/api/Bookings/Booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
  
      // Log the response
      console.log('Response Status:', response.status);
      const responseData = await response.json();
      console.log('Response Data:', responseData);
  
      if (!response.ok) {
        // Log validation errors
        if (responseData.errors) {
          console.error('Validation Errors:', responseData.errors);
        }
        throw new Error('Failed to create booking');
      }
  
      const data = await response.json();
      console.log('Booking created:', data);
  
      // Pass the new booking to the home component
      onAddEvent({
        id: bookingData.id,
        title: `${title} (${selectedCar})`,
        start,
        end,
        allDay: false,
        type: 'booking',
        selectedCar,
        repeatOption,
        repeatDays,
      });
  
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      setWarning('Failed to create booking. Please try again.');
    }
  };

  const toggleRepeatDay = (day) => {
    setRepeatDays((prevDays) =>
      prevDays.includes(day) ? prevDays.filter((d) => d !== day) : [...prevDays, day]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Three Dots Button (No Functionality) */}

      <div className="bg-white p-6 rounded-md w-full max-w-2xl relative">
        {/* Cross Button */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
          onClick={onClose}
        >
          &times; {/* Cross icon for cancel */}
        </button>

        <h2 className="text-lg font-bold mb-4">Add Car Booking</h2>

        {/* Warning Message */}
        {warning && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            {warning}
          </div>
        )}

        <hr className="pb-4" />

        <h3 className="text-lg font-bold text-purple-700 mb-4">Basic Information</h3>

        <div className="space-y-4">
          {/* Subject and Select Car */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                placeholder="Write a short note"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border rounded-full p-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Select Car</label>
              <select
                value={selectedCar}
                onChange={(e) => setSelectedCar(e.target.value)}
                className="border rounded-full p-2 w-full"
              >
                <option value="">Select a car</option>
                {carOptions.map((car, index) => (
                  <option key={index} value={car}>
                    {car}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Booking Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Booking Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded-full p-2 w-full"
              />
            </div>
          </div>

          {/* Start Time and End Time */}
          <div className="grid grid-cols-2 gap-4 pb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border rounded-full p-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="border rounded-full p-2 w-full"
              />
            </div>
          </div>

          <hr className="p-4" />

          <h3 className="text-lg font-bold text-purple-700 mb-4">Repeat Option</h3>

          {/* Repeat Option and Repeat On */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Repeat Option</label>
                <select
                  value={repeatOption}
                  onChange={(e) => setRepeatOption(e.target.value)}
                  className="border rounded-full p-2 w-full"
                >
                  <option value={1}>No Repeat</option>
                  <option value={2}>Daily</option>
                  <option value={3}>Weekly</option>
                </select>
              </div>
            </div>
            <label className="block text-sm font-medium mb-1">Repeat On</label>
            <div className="flex space-x-2">
              {['Su', 'Mo', 'Tu', 'Wd', 'Th', 'Fr', 'Sa'].map((day, index) => (
                <button
                  key={index}
                  onClick={() => toggleRepeatDay(day)}
                  className={`p-2 rounded-md ${
                    repeatDays.includes(day) ? 'bg-purple-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <hr className="p-4" />

          {/* Save and Cancel Buttons */}
          <div className="flex justify-between">
            <button
              className="bg-white text-purple-700 border border-purple-700 px-4 py-2 rounded-full"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded-full"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;