import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404: Page Not Found',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ fontSize: '5rem', fontWeight: 700, margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.25rem', margin: '1rem 0 2rem', color: '#555' }}>Sorry, this page could not be found.</p>
      <Link
        href="/"
        style={{ textDecoration: 'none', background: '#0f766e', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem' }}
      >
        Back to Home
      </Link>
    </div>
  )
}
