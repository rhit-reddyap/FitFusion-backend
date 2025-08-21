'use client';

import Link from 'next/link';

export default function CommunitiesPage() {
  // Later you’ll probably fetch these from Supabase / DB
  const communities = [
    { id: '1', name: 'Community 1' },
    { id: '2', name: 'Community 2' },
  ];

  return (
    <div>
      <h1>Communities</h1>
      <p>Join a community or create your own.</p>

      <ul>
        {communities.map((c) => (
          <li key={c.id}>
            <Link href={`/communities/${c.id}`}>{c.name}</Link>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          // 🚀 placeholder for future create logic
          alert('Open create community modal (coming soon)');
        }}
      >
        Create Community
      </button>
    </div>
  );
}
