'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function CommunityDetailPage() {
  const params = useParams();
  const communityId = params?.id;

  const [messages, setMessages] = useState([
    { user: 'User A', text: 'Great job today!' },
    { user: 'User B', text: 'Thanks! 💪' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { user: 'You', text: input.trim() }]);
    setInput('');
  };

  return (
    <div>
      <h1>Community {communityId}</h1>

      <h3>Feed</h3>
      <ul>
        <li>User A hit a new PR on Squat!</li>
        <li>User B logged 3 workouts this week 🔥</li>
      </ul>

      <h3>Chat</h3>
      <div
        style={{
          border: '1px solid #ccc',
          padding: '1rem',
          height: '200px',
          overflowY: 'auto',
          marginBottom: '0.5rem',
        }}
      >
        {messages.map((m, i) => (
          <p key={i}>
            <strong>{m.user}:</strong> {m.text}
          </p>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          placeholder="Type message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
