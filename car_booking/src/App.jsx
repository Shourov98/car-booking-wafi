
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  const toggleAuth = () => setAuthenticated(!authenticated);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home authenticated={authenticated} toggleAuth={toggleAuth} setAuthenticated={setAuthenticated} />} />
        <Route path="/login" element={<Login toggleAuth={toggleAuth} />} />
      </Routes>
    </Router>
  );
};

export default App;