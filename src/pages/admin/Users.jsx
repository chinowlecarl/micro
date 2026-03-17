import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, ShieldCheck, User } from 'lucide-react'
import { format } from 'date-fns'

export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false) })
  }, [])

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Users</h1>
        <p>All registered accounts on EventHub</p>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
        <input className="form-input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40, maxWidth: 400 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" style={{ width: 28, height: 28 }} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 16 }}>
          {filtered.map(u => {
            const initials = u.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '??'
            return (
              <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: u.role === 'admin' ? 'rgba(45,106,63,0.2)' : 'rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${u.role === 'admin' ? 'var(--primary-light)' : 'var(--border)'}` }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: u.role === 'admin' ? 'var(--primary-light)' : 'var(--accent)' }}>{initials}</span>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name}</span>
                    {u.role === 'admin' ? <ShieldCheck size={13} color="var(--primary-light)" /> : <User size={13} color="var(--text3)" />}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Joined {format(new Date(u.created_at), 'MMM d, yyyy')}</div>
                </div>
                <span className={u.role === 'admin' ? 'badge badge-published' : 'badge badge-draft'} style={{ textTransform: 'capitalize', flexShrink: 0 }}>{u.role}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
