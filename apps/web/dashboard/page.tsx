'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Dashboard</h1>
      <p>Welcome back! Choose what you’d like to do today:</p>

      <ul style={{ lineHeight: '2' }}>
        <li><Link href="/analytics">📊 View Analytics</Link></li>
        <li><Link href="/ai-coach">🤖 AI Coach</Link></li>
        <li><Link href="/communities">👥 Communities</Link></li>
        <li><Link href="/gamification">🎮 Gamification</Link></li>
      </ul>
    </div>
  );
}
