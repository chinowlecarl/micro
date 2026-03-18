import { Navbar } from './Navbar'

export function Layout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg1)' }}>
      <Navbar />

      <main style={{
        flex: 1,
        padding: '24px',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 70px)'
      }}>
        {children}
      </main>
    </div>
  )
};