'use client';

import Link from 'next/link';

export default function CommunitiesPage() {
  return (
    <div>
      <h1>Communities</h1>
      <p>Join a community or create your own.</p>
      <ul>
        <li><Link href="/communities/1">Community 1</Link></li>
        <li><Link href="/communities/2">Community 2</Link></li>
      </ul>
      <button>Create Community</button>
    </div>
  );
}
