import React, { useState } from 'react';

function CreateChallenge() {
  const [walletAddress, setWalletAddress] = useState('');
  const [wagerAmount, setWagerAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/challenge/create?creator_wallet=${walletAddress}&wager_amount=${wagerAmount}`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create challenge');
      }
      const data = await response.json();
      setMessage(`Challenge created with ID: ${data._id}`);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Create a New Challenge</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Creator Wallet Address:</label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Wager Amount:</label>
          <input
            type="number"
            value={wagerAmount}
            onChange={(e) => setWagerAmount(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Challenge</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreateChallenge;
