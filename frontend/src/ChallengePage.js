import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function ChallengePage() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/challenge/get?id=${id}`);
        if (!response.ok) {
          throw new Error('Challenge not found');
        }
        const data = await response.json();
        setChallenge(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [id]);

  if (loading) return <div>Loading challenge...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Challenge Details</h1>
      <p><strong>Creator Wallet:</strong> {challenge.creator_wallet}</p>
      <p><strong>Wager Amount:</strong> {challenge.wager_amount}</p>
      <p><strong>Status:</strong> {challenge.status}</p>
      <p><strong>Condition:</strong> {challenge.condition}</p>
    </div>
  );
}

export default ChallengePage;
