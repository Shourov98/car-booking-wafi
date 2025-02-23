
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiMessageSquare, FiUser, FiLogIn, FiLogOut } from 'react-icons/fi';
import { FaPlus, FaBars } from 'react-icons/fa';

const Navbar = ({ authenticated, setAuthenticated, setShowModal, toggleSidebar }) => {
  const [userMenuVisible, setUserMenuVisible] = useState(false);

  // Handle outside click 
  const handleOutsideClick = (e) => {
    if (e.target.closest('.user-menu') === null) {
      setUserMenuVisible(false);
    }
  };

  // Listen for clicks to close UserMenu
  React.useEffect(() => {
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className="flex justify-between items-center bg-gray-200 p-4 text-black">
      {/* Hamburger Icon for Small Screens */}
      <button
        className="md:hidden p-2 bg-white-700 text-black rounded-md"
        onClick={toggleSidebar}
      >
        <FaBars size={18} />
      </button>

      <h1 className="text-4xl font-bold">Calendar</h1>

      {/* Add Booking Button */}
      <button
        className="flex items-center bg-purple-700 text-white px-4 py-2 rounded-md"
        onClick={() => setShowModal(true)}
      >
        <FaPlus className="mr-2" /> Add Booking
      </button>

      {/* Right Section: Notification, Message, Profile */}
      <div className="flex items-center space-x-6 md:space-x-4 sm:space-x-2">
        
        <div className="flex items-center space-x-2 hover:bg-gray-400 p-2 rounded-md cursor-pointer">
          <FiBell size={24} />
          <span className="hidden lg:block">Notification</span>
        </div>

        <div className="flex items-center space-x-2 hover:bg-gray-400 p-2 rounded-md cursor-pointer">
          <FiMessageSquare size={24} />
          <span className="hidden lg:block">Message</span>
        </div>

        {authenticated ? (
          <div
            className="relative user-menu flex items-center space-x-2 hover:bg-gray-400 p-2 rounded-md cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setUserMenuVisible(!userMenuVisible);
            }}
          >
            <FiUser size={24} />
            <span className="hidden lg:block">Profile</span>

            {/* User Menu Dropdown */}
            {userMenuVisible && (
              <div className="absolute top-full right-0 mt-2 bg-white text-black shadow-lg rounded-md p-4">
                <button
                  className="flex items-center space-x-2 text-black hover:text-red-600"
                  onClick={() => setAuthenticated(false)}
                >
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="#"
            className="flex items-center space-x-2 hover:bg-purple-700 p-2 rounded-md"
            onClick={() => setAuthenticated(true)}
          >
            <FiLogIn size={24} />
            <span className="hidden lg:block">Login</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;