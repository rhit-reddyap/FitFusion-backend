export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <nav style={{ padding: '1rem', background: '#111', color: '#fff' }}>
          <a href="/dashboard" style={{ marginRight: '1rem' }}>Dashboard</a>
          <a href="/food" style={{ marginRight: '1rem' }}>Food</a>
          <a href="/workouts" style={{ marginRight: '1rem' }}>Workouts</a>
          <a href="/analytics" style={{ marginRight: '1rem' }}>Analytics</a>
          <a href="/profile">Profile</a>
        </nav>
        <main style={{ padding: '1rem' }}>{children}</main>
      </body>
    </html>
  );
}
