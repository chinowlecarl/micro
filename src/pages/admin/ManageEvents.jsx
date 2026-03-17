import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Plus, Edit, Trash2, Eye, Calendar, MapPin, Clock, Users } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '../../hooks/useToast'
import { Toast } from '../../components/Toast'

export function ManageEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const { toast, showToast } = useToast()

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('*, registrations(count)')
      .order('event_date', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('events').delete().eq('id', id)
    setDeleteId(null)
    showToast('Event deleted', 'success')
    fetchEvents()
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Events Management</h1>
          <p style={{ color: 'var(--text2)' }}>Create, update, and monitor campus activities.</p>
        </div>
        <Link to="/admin/events/create" className="btn btn-accent">
          <Plus size={16} /> Create Event
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <h3>No events yet</h3>
          <p>Create your first campus event</p>
          <Link to="/admin/events/create" className="btn btn-accent" style={{ marginTop: 16 }}><Plus size={16} /> Create Event</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {events.map(event => (
            <div key={event.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '6px 10px', textAlign: 'center', minWidth: 48 }}>
                      <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{format(new Date(event.event_date), 'MMM').toUpperCase()}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{format(new Date(event.event_date), 'd')}</div>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{event.title}</h3>
                    </div>
                  </div>
                  <span className={`badge badge-${event.status}`} style={{ flexShrink: 0 }}>{event.status}</span>
                </div>
                {event.description && (
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.description}
                  </p>
                )}
              </div>
              <div style={{ padding: '12px 20px', display: 'flex', gap: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text3)' }}>
                  <Clock size={13} color="var(--accent)" /> {event.event_time}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text3)' }}>
                  <MapPin size={13} color="var(--accent)" /> {event.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text3)', marginLeft: 'auto' }}>
                  <Users size={13} /> {event.registrations?.[0]?.count ?? 0}/{event.capacity}
                </span>
              </div>
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <Link to={`/admin/events/edit/${event.id}`} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  <Edit size={14} /> Edit
                </Link>
                <button onClick={() => setDeleteId(event.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger-light)', borderColor: 'rgba(192,57,43,0.3)' }}>
                  <Trash2 size={14} />
                </button>
                <Link to={`/admin/events/${event.id}`} className="btn btn-ghost btn-sm">
                  <Eye size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Event</h3>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text2)' }}>Are you sure you want to delete this event? All registrations will also be deleted. This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
      <Toast toast={toast} />
    </div>
  )
}
