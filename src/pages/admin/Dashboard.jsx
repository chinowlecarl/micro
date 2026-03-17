import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Calendar, Users, Ticket, TrendingUp, Plus } from 'lucide-react'
import { format } from 'date-fns'

export function AdminDashboard() {
  const [stats, setStats] = useState({ events: 0, users: 0, registrations: 0, checkins: 0 })
  const [recentEvents, setRecentEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [{ count: events }, { count: users }, { count: regs }, { count: checkins }, { data: evts }] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
        supabase.from('registrations').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'checked_in'),
        supabase.from('events').select('*').order('created_at', { ascending: false }).limit(5),
      ])
      setStats({ events: events || 0, users: users || 0, registrations: regs || 0, checkins: checkins || 0 })
      setRecentEvents(evts || [])
      setLoading(false)
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Total Events', value: stats.events, icon: Calendar, color: 'var(--primary-light)', bg: 'rgba(45,106,63,0.15)' },
    { label: 'Registered Users', value: stats.users, icon: Users, color: '#5dade2', bg: 'rgba(41,128,185,0.15)' },
    { label: 'Total Registrations', value: stats.registrations, icon: Ticket, color: 'var(--accent)', bg: 'rgba(201,168,76,0.15)' },
    { label: 'Checked In', value: stats.checkins, icon: TrendingUp, color: '#27ae60', bg: 'rgba(39,174,96,0.15)' },
  ]

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--text2)' }}>Overview of campus event activity</p>
        </div>
        <Link to="/admin/events/create" className="btn btn-accent">
          <Plus size={16} /> Create Event
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
            </div>
            <div style={{ fontSize: 32, fontFamily: 'Syne', fontWeight: 700 }}>
              {loading ? <span className="spinner" style={{ width: 24, height: 24 }} /> : value}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18 }}>Recent Events</h2>
          <Link to="/admin/events" style={{ color: 'var(--accent)', fontSize: 13 }}>View all →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recentEvents.map(event => (
            <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ textAlign: 'center', minWidth: 44 }}>
                <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{format(new Date(event.event_date), 'MMM').toUpperCase()}</div>
                <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{format(new Date(event.event_date), 'd')}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{event.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>{event.location} · {event.event_time}</div>
              </div>
              <span className={`badge badge-${event.status}`}>{event.status}</span>
            </div>
          ))}
          {!loading && recentEvents.length === 0 && (
            <p style={{ color: 'var(--text3)', textAlign: 'center', padding: 20 }}>No events yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
