import React, { useState } from 'react';

function AcceptChallenge() {
  const [challengeId, setChallengeId] = useState('');
  const [chessUsername, setChessUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/challenge/accept?challenge_id=${challengeId}&chess_com_username=${chessUsername}`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to accept challenge');
      }
      const data = await response.json();
      setMessage(`Challenge accepted! Status: ${data.status}`);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Accept a Challenge</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Challenge ID:</label>
          <input
            type="text"
            value={challengeId}
            onChange={(e) => setChallengeId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Chess.com Username:</label>
          <input
            type="text"
            value={chessUsername}
            onChange={(e) => setChessUsername(e.target.value)}
            required
          />
        </div>
        <button type="submit">Accept Challenge</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AcceptChallenge;
