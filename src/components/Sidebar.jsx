import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Calendar, Ticket, Users, LogOut, QrCode, Settings } from 'lucide-react'

export function Sidebar() {
  const { profile, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const adminLinks = [
    { to: '/admin', icon: Home, label: 'Dashboard' },
    { to: '/admin/events', icon: Calendar, label: 'Manage Events' },
    { to: '/admin/registrations', icon: Ticket, label: 'Registrations' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/checkin', icon: QrCode, label: 'Check-In Desk' },
  ]

  const userLinks = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/events', icon: Calendar, label: 'Browse Events' },
    { to: '/my-tickets', icon: Ticket, label: 'My Tickets' },
  ]

  const links = isAdmin ? adminLinks : userLinks

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '??'

  return (
    <aside style={{
      width: 220, minHeight: '100vh',
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, bottom: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Calendar size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: 'var(--text)', lineHeight: 1 }}>EventHub</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{isAdmin ? 'Admin Portal' : 'FEU ROOSEVELT'}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== '/admin' && to !== '/dashboard' && location.pathname.startsWith(to))
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius-sm)',
              fontSize: 14, fontWeight: 500,
              background: active ? 'rgba(45,106,63,0.2)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text2)',
              transition: 'all 0.15s',
              borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)' }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)' }}}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', marginBottom: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
          }}>{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name}</div>
            <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'capitalize' }}>{profile?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  )
}
