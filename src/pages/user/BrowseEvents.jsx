import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { Toast } from '../../components/Toast'
import { Calendar, MapPin, Clock, Users, Search, Lock } from 'lucide-react'
import { format } from 'date-fns'

export function BrowseEvents() {
  const [events, setEvents] = useState([])
  // Stores [{ event_id: '...', checked_in_at: '2023-01-01...' }]
  const [myRegistrations, setMyRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [registering, setRegistering] = useState(null)
  const { user } = useAuth()
  const { toast, showToast } = useToast()

  const fetchData = async () => {
    if (!user?.id) return
    const [{ data: evts }, { data: regs }] = await Promise.all([
      supabase.from('events').select('*, registrations(count)').eq('status', 'published').order('event_date'),
      // Fetch checked_in_at instead of checked_in
      supabase.from('registrations').select('event_id, checked_in_at').eq('user_id', user.id),
    ])
    setEvents(evts || [])
    setMyRegistrations(regs || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user?.id])

  const getRegDoc = (eventId) => myRegistrations.find(r => r.event_id === eventId)

  async function handleRegister(eventId) {
    if (getRegDoc(eventId) || registering) return
    setRegistering(eventId)

    const { error } = await supabase
      .from('registrations')
      .insert({ event_id: eventId, user_id: user.id })

    if (error) {
      setRegistering(null)
      showToast(error.message, 'error')
      return
    }

    await fetchData()
    setRegistering(null)
    showToast('Registered successfully!', 'success')
  }

  async function handleUnregister(eventId) {
    const reg = getRegDoc(eventId)

    // Check if timestamp exists. If it does, they are checked in.
    if (!reg || reg.checked_in_at !== null) {
      showToast('Cannot unregister: Ticket already checked in.', 'error')
      return
    }

    setRegistering(eventId)
    const { error } = await supabase
      .from('registrations')
      .delete()
      .match({ event_id: eventId, user_id: user.id })
    // We don't filter by checked_in_at here because delete match 
    // is usually simpler, but the logic above stops the click.

    if (error) {
      setRegistering(null)
      showToast(error.message, 'error')
      return
    }

    setMyRegistrations(prev => prev.filter(r => r.event_id !== eventId))
    await fetchData()
    setRegistering(null)
    showToast('Registration removed.', 'info')
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
        <input className="form-input" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40, maxWidth: 400 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 20 }}>
          {filtered.map(event => {
            const regDoc = getRegDoc(event.id)
            const isRegistered = !!regDoc
            // LOGIC: If checked_in_at has a value, they are checked in
            const isCheckedIn = regDoc && regDoc.checked_in_at !== null
            const regCount = event.registrations?.[0]?.count ?? 0
            const isFull = regCount >= event.capacity
            const isProcessing = registering === event.id

            return (
              <div key={event.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
                <div style={{ background: isCheckedIn ? '#2c3e50' : 'var(--primary)', padding: '24px 20px', color: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0 }}>{event.title}</h3>
                    {isRegistered && (
                      <span className={`badge ${isCheckedIn ? 'badge-success' : 'badge-registered'}`}>
                        {isCheckedIn ? 'Checked In' : 'Registered'}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ padding: 20, flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text3)', fontSize: 13 }}>
                    <span><Clock size={14} /> {event.event_time}</span>
                    <span><MapPin size={14} /> {event.location}</span>
                    <span><Users size={14} /> {regCount}/{event.capacity} spots</span>
                  </div>
                </div>

                <div style={{ padding: 20, borderTop: '1px solid var(--border)' }}>
                  {isRegistered ? (
                    isCheckedIn ? (
                      <button className="btn btn-ghost" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }} disabled>
                        <Lock size={14} style={{ marginRight: 8 }} /> Locked (Checked In)
                      </button>
                    ) : (
                      <button
                        className="btn btn-ghost"
                        style={{ width: '100%', color: '#e74c3c' }}
                        onClick={() => handleUnregister(event.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <span className="spinner" /> : 'Unregister'}
                      </button>
                    )
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => handleRegister(event.id)}
                      disabled={isFull || isProcessing}
                    >
                      {isProcessing ? <span className="spinner" /> : isFull ? 'Event Full' : 'Register Now'}
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
};