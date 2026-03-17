import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { Toast } from '../../components/Toast'
import { Calendar, MapPin, Clock, Users, Search } from 'lucide-react'
import { format } from 'date-fns'

export function BrowseEvents() {
  const [events, setEvents] = useState([])
  const [myRegistrations, setMyRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [registering, setRegistering] = useState(null)
  const { user } = useAuth()
  const { toast, showToast } = useToast()

  useEffect(() => {
    Promise.all([
      supabase.from('events').select('*, registrations(count)').eq('status', 'published').order('event_date'),
      supabase.from('registrations').select('event_id').eq('user_id', user.id),
    ]).then(([{ data: evts }, { data: regs }]) => {
      setEvents(evts || [])
      setMyRegistrations((regs || []).map(r => r.event_id))
      setLoading(false)
    })
  }, [user.id])

  async function handleRegister(eventId) {
    setRegistering(eventId)
    const { error } = await supabase.from('registrations').insert({ event_id: eventId, user_id: user.id })
    setRegistering(null)
    if (error) { showToast(error.message, 'error'); return }
    setMyRegistrations(prev => [...prev, eventId])
    showToast('You\'re registered! Check My Tickets for your QR code.', 'success')
  }

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Browse Events</h1>
        <p>Discover and register for upcoming campus activities</p>
      </div>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
        <input className="form-input" placeholder="Search events or locations..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40, maxWidth: 400 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><Calendar size={48} /><h3>No events found</h3><p>Check back later for upcoming activities</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 20 }}>
          {filtered.map(event => {
            const isRegistered = myRegistrations.includes(event.id)
            const regCount = event.registrations?.[0]?.count ?? 0
            const isFull = regCount >= event.capacity
            return (
              <div key={event.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                <div style={{ background: 'var(--primary)', padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(201,168,76,0.1) 0%, transparent 60%)' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                          {format(new Date(event.event_date), 'EEEE, MMMM d').toUpperCase()}
                        </div>
                        <h3 style={{ color: 'white', fontSize: 18, lineHeight: 1.3 }}>{event.title}</h3>
                      </div>
                      {isRegistered && <span className="badge badge-registered" style={{ flexShrink: 0 }}>Registered</span>}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '16px 20px', flex: 1 }}>
                  {event.description && <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.description}</p>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text3)' }}>
                      <Clock size={13} color="var(--accent)" /> {event.event_time}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text3)' }}>
                      <MapPin size={13} color="var(--accent)" /> {event.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text3)' }}>
                      <Users size={13} /> {regCount}/{event.capacity} spots filled
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginTop: 12, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((regCount / event.capacity) * 100, 100)}%`, background: isFull ? 'var(--danger-light)' : 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                </div>
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
                  {isRegistered ? (
                    <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', color: '#27ae60', borderColor: 'rgba(39,174,96,0.3)' }} disabled>
                      ✓ Already Registered
                    </button>
                  ) : (
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => handleRegister(event.id)} disabled={isFull || registering === event.id}>
                      {registering === event.id ? <span className="spinner" /> : isFull ? 'Event Full' : 'Register Now'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <Toast toast={toast} />
    </div>
  )
}
