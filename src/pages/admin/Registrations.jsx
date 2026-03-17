import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Search } from 'lucide-react'
import { format } from 'date-fns'

export function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('registrations')
      .select('*, profiles(full_name, email), events(title, event_date)')
      .order('registered_at', { ascending: false })
      .then(({ data }) => { setRegistrations(data || []); setLoading(false) })
  }, [])

  const filtered = registrations.filter(r =>
    r.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.events?.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.ticket_code?.includes(search)
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>All Registrations</h1>
        <p>View and manage all event registrations</p>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
        <input className="form-input" placeholder="Search by name, email, event or ticket code..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40, maxWidth: 480 }} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                  {['Student', 'Event', 'Ticket Code', 'Status', 'Registered At', 'Checked In'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text3)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500 }}>{r.profiles?.full_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{r.profiles?.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div>{r.events?.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{r.events?.event_date}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--text3)' }}>{r.ticket_code.slice(0,16)}...</td>
                    <td style={{ padding: '12px 16px' }}><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td style={{ padding: '12px 16px', color: 'var(--text2)', fontSize: 12 }}>{format(new Date(r.registered_at), 'MMM d, HH:mm')}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text2)', fontSize: 12 }}>
                      {r.checked_in_at ? format(new Date(r.checked_in_at), 'MMM d, HH:mm') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No registrations found</p>}
          </div>
        )}
      </div>
    </div>
  )
}
