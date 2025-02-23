
import React from 'react';

const Login = ({ toggleAuth }) => (
  <div className="flex justify-center items-center h-screen bg-gray-200">
    <div className="bg-white p-6 rounded-md shadow-md">
      <h2 className="text-lg font-bold">Login</h2>
      <button
        className="bg-purple-600 text-white px-4 py-2 rounded-md mt-4"
        onClick={() => {
          toggleAuth();
          toast.success('Logged in successfully!');
        }}
      >
        Login
      </button>
    </div>
  </div>
);

export default Login;
