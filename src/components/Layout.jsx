import { Sidebar } from './Sidebar'

export function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220, padding: '32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
