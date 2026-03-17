import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import QRCode from 'qrcode'
import { Ticket, Calendar, MapPin, Clock, Download, X } from 'lucide-react'
import { format } from 'date-fns'

export function MyTickets() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const { user, profile } = useAuth()

  useEffect(() => {
    supabase
      .from('registrations')
      .select('*, events(title, event_date, event_time, location, status)')
      .eq('user_id', user.id)
      .order('registered_at', { ascending: false })
      .then(({ data }) => { setRegistrations(data || []); setLoading(false) })
  }, [user.id])

  async function openTicket(reg) {
    setSelectedTicket(reg)
    const url = await QRCode.toDataURL(reg.ticket_code, { width: 260, margin: 2, color: { dark: '#0d0f14', light: '#ffffff' } })
    setQrUrl(url)
  }

  async function downloadTicket() {
    if (!qrUrl || !selectedTicket) return
    const a = document.createElement('a')
    a.href = qrUrl
    a.download = `ticket-${selectedTicket.ticket_code.slice(0,8)}.png`
    a.click()
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>My Tickets</h1>
        <p>Your registered events and QR tickets</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : registrations.length === 0 ? (
        <div className="empty-state"><Ticket size={48} /><h3>No tickets yet</h3><p>Register for an event to get your QR ticket</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 20 }}>
          {registrations.map(reg => (
            <div key={reg.id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => openTicket(reg)}>
              {/* Ticket header */}
              <div style={{ background: reg.status === 'checked_in' ? 'var(--primary)' : 'var(--bg3)', padding: '20px', borderBottom: '1px dashed var(--border)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg)', transform: 'translateY(-50%)', border: '1px solid var(--border)' }} />
                <div style={{ position: 'absolute', top: '50%', right: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg)', transform: 'translateY(-50%)', border: '1px solid var(--border)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>EVENT TICKET</div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3, maxWidth: 220 }}>{reg.events?.title}</h3>
                  </div>
                  <span className={`badge badge-${reg.status}`}>{reg.status.replace('_', ' ')}</span>
                </div>
              </div>
              {/* Ticket body */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                    <Calendar size={13} color="var(--accent)" />
                    {format(new Date(reg.events?.event_date), 'MMMM d, yyyy')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                    <Clock size={13} color="var(--accent)" /> {reg.events?.event_time}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                    <MapPin size={13} color="var(--accent)" /> {reg.events?.location}
                  </span>
                </div>
                <div style={{ textAlign: 'center', padding: '10px', background: 'white', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Click to view QR Code</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#333', letterSpacing: 1 }}>{reg.ticket_code.slice(0,20)}...</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => { setSelectedTicket(null); setQrUrl('') }}>
          <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', width: '100%', maxWidth: 420, overflow: 'hidden', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ background: 'var(--primary)', padding: '28px 24px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(201,168,76,0.1) 0%, transparent 60%)' }} />
              <button onClick={() => { setSelectedTicket(null); setQrUrl('') }} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '4px', color: 'white', cursor: 'pointer', display: 'flex' }}>
                <X size={16} />
              </button>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>MODERN WEB DEVELOPMENT</div>
                <h2 style={{ color: 'white', fontSize: 22, lineHeight: 1.2, marginBottom: 16 }}>{selectedTicket.events?.title}</h2>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                    <Calendar size={12} /> {format(new Date(selectedTicket.events?.event_date), 'MMM d, yyyy')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                    <MapPin size={12} /> {selectedTicket.events?.location}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div style={{ padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 2 }}>{profile?.full_name}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>{profile?.email}</div>

              {qrUrl ? (
                <div style={{ background: 'white', borderRadius: 12, padding: 16, display: 'inline-block', marginBottom: 16 }}>
                  <img src={qrUrl} alt="QR Ticket" style={{ display: 'block', width: 200, height: 200 }} />
                </div>
              ) : <div style={{ width: 232, height: 232, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>}

              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 16 }}>
                Scan at the entrance
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text3)', wordBreak: 'break-all', marginBottom: 20 }}>
                {selectedTicket.ticket_code}
              </div>
              <span className={`badge badge-${selectedTicket.status}`} style={{ fontSize: 13, padding: '6px 16px' }}>
                {selectedTicket.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={downloadTicket}>
                <Download size={15} /> Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
