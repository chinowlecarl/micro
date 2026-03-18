import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, Calendar, Ticket, Users, LogOut, QrCode } from 'lucide-react'

export function Navbar() {
  const { profile, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const adminLinks = [
    { to: '/admin', icon: Home, label: 'Dashboard' },
    { to: '/admin/events', icon: Calendar, label: 'Events' },
    { to: '/admin/registrations', icon: Ticket, label: 'Tickets' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/checkin', icon: QrCode, label: 'Check-In' },
  ]

  const userLinks = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/events', icon: Calendar, label: 'Browse' },
    { to: '/my-tickets', icon: Ticket, label: 'My Tickets' },
  ]

  const links = isAdmin ? adminLinks : userLinks

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

  return (
    <header style={{
      width: '100%',
      height: '70px',
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      {/* Logo Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
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

      {/* Navigation Links - Horizontal Row */}
      <nav style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== '/admin' && to !== '/dashboard' && location.pathname.startsWith(to))
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: 14, fontWeight: 500,
              background: active ? 'rgba(45,106,63,0.15)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text2)',
              transition: 'all 0.2s',
              borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
              textDecoration: 'none'
            }}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRight: '1px solid var(--border)', paddingRight: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{profile?.full_name}</div>
            <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{profile?.role}</div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white'
          }}>{initials}</div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ff4d4d'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  )
};