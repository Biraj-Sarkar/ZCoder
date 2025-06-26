import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import CodingPage from './pages/CodingPage';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/coding" element={<CodingPage />} />
          {/* You can add a proper Room component later */}
          {/* <Route path="/room/:roomName" element={<div>Room Component Here</div>} /> */}
        </Routes>
    </Router>
  );
}

export default App;
