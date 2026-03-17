import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Calendar, MapPin, Clock, Users, ArrowLeft, QrCode, Edit } from 'lucide-react'
import { format } from 'date-fns'

export function AdminEventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const [{ data: ev }, { data: regs }] = await Promise.all([
        supabase.from('events').select('*').eq('id', id).single(),
        supabase.from('registrations').select('*, profiles(full_name, email)').eq('event_id', id).order('registered_at', { ascending: false }),
      ])
      setEvent(ev)
      setRegistrations(regs || [])
      setLoading(false)
    }
    fetch()
  }, [id])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
  if (!event) return <p>Event not found</p>

  const checkedIn = registrations.filter(r => r.status === 'checked_in').length

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <Link to="/admin/events" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /></Link>
        <h1 style={{ fontSize: 22, flex: 1 }}>{event.title}</h1>
        <span className={`badge badge-${event.status}`}>{event.status}</span>
        <Link to={`/admin/events/edit/${id}`} className="btn btn-ghost btn-sm"><Edit size={14} /> Edit</Link>
        <Link to={`/admin/checkin?event=${id}`} className="btn btn-primary btn-sm"><QrCode size={14} /> Launch Check-In</Link>
      </div>

      {/* Hero card */}
      <div style={{ background: 'var(--primary)', borderRadius: 'var(--radius)', padding: '32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(201,168,76,0.1) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 32, color: 'white', marginBottom: 12 }}>{event.title}</h2>
          {event.description && <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 20, maxWidth: 600 }}>{event.description}</p>}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
              <Calendar size={16} color="var(--accent)" />
              {format(new Date(event.event_date), 'MMMM d, yyyy')} · {event.event_time}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
              <MapPin size={16} color="var(--accent)" /> {event.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
              <Users size={16} color="var(--accent)" /> {registrations.length}/{event.capacity} registered
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Registered', value: registrations.length, color: 'var(--accent)' },
          { label: 'Checked In', value: checkedIn, color: '#27ae60' },
          { label: 'Remaining', value: event.capacity - registrations.length, color: '#5dade2' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 36, fontFamily: 'Syne', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Registrations table */}
      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Registrations ({registrations.length})</h3>
        {registrations.length === 0 ? (
          <p style={{ color: 'var(--text3)', textAlign: 'center', padding: 20 }}>No registrations yet</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Name', 'Email', 'Ticket Code', 'Status', 'Registered'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text3)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registrations.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px' }}>{r.profiles?.full_name}</td>
                    <td style={{ padding: '12px', color: 'var(--text2)' }}>{r.profiles?.email}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: 12, color: 'var(--text3)' }}>{r.ticket_code.slice(0, 12)}...</td>
                    <td style={{ padding: '12px' }}><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td style={{ padding: '12px', color: 'var(--text2)', fontSize: 12 }}>{format(new Date(r.registered_at), 'MMM d, yyyy HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
