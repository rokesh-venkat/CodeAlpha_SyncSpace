export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <section style={{ maxWidth: '720px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', margin: 0 }}>SyncSpace</h1>
        <p style={{ fontSize: '1.125rem', lineHeight: 1.7, opacity: 0.9 }}>
          A collaborative meeting workspace scaffold for video, chat, and whiteboard flows.
        </p>
      </section>
    </main>
  );
}