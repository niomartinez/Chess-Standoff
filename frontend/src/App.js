import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './Home';
import ChallengePage from './ChallengePage';
import CreateChallenge from './CreateChallenge';
import AcceptChallenge from './AcceptChallenge';
import './App.css';


function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/create-challenge">Create Challenge</Link></li>
          <li><Link to="/accept-challenge">Accept Challenge</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/challenge/:id" element={<ChallengePage />} />
        <Route path="/create-challenge" element={<CreateChallenge />} />
        <Route path="/accept-challenge" element={<AcceptChallenge />} />
      </Routes>
    </Router>
  );
}

export default App;
