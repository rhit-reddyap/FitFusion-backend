'use client';

import { useParams } from 'next/navigation';

export default function CommunityDetailPage() {
  const params = useParams();
  const communityId = params?.id;

  return (
    <div>
      <h1>Community {communityId}</h1>
      <h3>Feed</h3>
      <ul>
        <li>User A hit a new PR on Squat!</li>
        <li>User B logged 3 workouts this week 🔥</li>
      </ul>
      <h3>Chat</h3>
      <div style={{ border: '1px solid #ccc', padding: '1rem', height: '200px', overflowY: 'auto' }}>
        <p><strong>User A:</strong> Great job today!</p>
        <p><strong>User B:</strong> Thanks! 💪</p>
      </div>
      <input placeholder="Type message..." style={{ marginTop: '0.5rem', width: '100%' }} />
    </div>
  );
}
