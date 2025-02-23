
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaProjectDiagram } from 'react-icons/fa';
import { MdEditCalendar } from 'react-icons/md';
import { BsCalendar2Check } from 'react-icons/bs';

const Sidebar = ({ isSidebarOpen, setShowModal, closeSidebar }) => {
  return (
    <>
      {/* Backdrop for small screens */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative w-64 bg-gray-100 text-black h-full flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* App Title */}
        <div className="flex items-center px-6 py-6 text-xl font-bold">
          <MdEditCalendar size={28} />
          <span className="px-3 text-2xl">Car Booking</span>
        </div>

        <nav className="p-4 space-y-4">
          {/* Calendar */}
          <Link
            to="/"
            className="flex items-center text-lg font-medium text-purple-700 bg-purple-200 px-4 py-3 rounded-md"
          >
            <FaCalendarAlt className="mr-3 h-5 w-5" /> Calendar
          </Link>

          {/* Add Booking */}
          <button
            className="flex items-center text-lg font-medium text-gray-700 hover:text-purple-700 px-4 py-3 rounded-md"
            onClick={() => setShowModal(true)}
          >
            <BsCalendar2Check className="mr-3 h-5 w-5" /> Add Booking
          </button>

          {/* Workflows */}
          <Link
            to="#"
            className="flex items-center text-lg font-medium text-gray-700 hover:text-purple-700 px-4 py-3 rounded-md"
          >
            <FaProjectDiagram className="mr-3 h-5 w-5" /> Workflows
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;