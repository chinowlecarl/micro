import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Calendar, Ticket, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

export function UserDashboard() {
  const { profile } = useAuth()
  const [regs, setRegs] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      supabase.from('registrations').select('*, events(title, event_date, event_time, location)').eq('user_id', profile.id).order('registered_at', { ascending: false }).limit(5),
      supabase.from('events').select('*').eq('status', 'published').gte('event_date', new Date().toISOString().split('T')[0]).order('event_date').limit(4),
    ]).then(([{ data: r }, { data: e }]) => {
      setRegs(r || [])
      setUpcomingEvents(e || [])
      setLoading(false)
    })
  }, [profile])

  const checkedIn = regs.filter(r => r.status === 'checked_in').length

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Welcome back, {profile?.full_name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--text2)' }}>Here's what's happening around campus</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Events Registered', value: regs.length, icon: Ticket, color: 'var(--accent)', bg: 'rgba(201,168,76,0.15)' },
          { label: 'Checked In', value: checkedIn, icon: CheckCircle, color: '#27ae60', bg: 'rgba(39,174,96,0.15)' },
          { label: 'Upcoming Events', value: upcomingEvents.length, icon: Calendar, color: '#5dade2', bg: 'rgba(41,128,185,0.15)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={17} color={color} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
            </div>
            <div style={{ fontSize: 30, fontFamily: 'Syne', fontWeight: 700 }}>{loading ? '—' : value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* My recent registrations */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16 }}>My Tickets</h3>
            <Link to="/my-tickets" style={{ fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {regs.slice(0,4).map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.events?.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{r.events?.event_date}</div>
                </div>
                <span className={`badge badge-${r.status}`} style={{ fontSize: 11 }}>{r.status.replace('_',' ')}</span>
              </div>
            ))}
            {!loading && regs.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>No tickets yet</p>}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16 }}>Upcoming Events</h3>
            <Link to="/events" style={{ fontSize: 13, color: 'var(--accent)' }}>Browse all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingEvents.map(e => (
              <div key={e.id} style={{ display: 'flex', gap: 12, padding: '10px 12px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ textAlign: 'center', minWidth: 36 }}>
                  <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>{format(new Date(e.event_date), 'MMM').toUpperCase()}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{format(new Date(e.event_date), 'd')}</div>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{e.location}</div>
                </div>
              </div>
            ))}
            {!loading && upcomingEvents.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>No upcoming events</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
