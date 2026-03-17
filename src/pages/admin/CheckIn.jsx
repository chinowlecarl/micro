import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { QrCode, CheckCircle, XCircle, Camera, Keyboard } from 'lucide-react'

export function CheckInDesk() {
  const [searchParams] = useSearchParams()
  const eventIdParam = searchParams.get('event')
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(eventIdParam || '')
  const [mode, setMode] = useState('manual') // 'manual' | 'camera'
  const [manualCode, setManualCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scannerActive, setScannerActive] = useState(false)
  const videoRef = useRef(null)
  const scannerRef = useRef(null)

  useEffect(() => {
    supabase.from('events').select('id, title, event_date').eq('status', 'published').order('event_date')
      .then(({ data }) => setEvents(data || []))
  }, [])

  async function processTicket(code) {
    if (!code.trim()) return
    setLoading(true)
    setResult(null)
    const { data, error } = await supabase.rpc('checkin_by_ticket', { p_ticket_code: code.trim() })
    setLoading(false)
    if (error) { setResult({ success: false, message: error.message }); return }
    setResult(data)
    if (data.success) setManualCode('')
  }

  async function startScanner() {
    setScannerActive(true)
    try {
      const QrScanner = (await import('qr-scanner')).default
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        scannerRef.current = new QrScanner(videoRef.current, result => {
          processTicket(result.data)
          scannerRef.current?.stop()
          setScannerActive(false)
          stream.getTracks().forEach(t => t.stop())
        }, { returnDetailedScanResult: true })
        scannerRef.current.start()
      }
    } catch (err) {
      setResult({ success: false, message: 'Camera not available. Use manual entry.' })
      setScannerActive(false)
    }
  }

  function stopScanner() {
    scannerRef.current?.stop()
    scannerRef.current = null
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setScannerActive(false)
  }

  function switchMode(m) {
    if (scannerActive) stopScanner()
    setMode(m)
    setResult(null)
  }

  return (
    <div className="fade-in" style={{ maxWidth: 680 }}>
      <div className="page-header">
        <h1>Check-In Desk</h1>
        <p>Scan QR tickets or enter codes manually to check in attendees</p>
      </div>

      {/* Event selector */}
      <div className="card" style={{ marginBottom: 24 }}>
        <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Select Event (optional filter)</label>
        <select className="form-input" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
          <option value="">All Events</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title} — {e.event_date}</option>)}
        </select>
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'var(--bg2)', borderRadius: 'var(--radius-sm)', padding: 4, border: '1px solid var(--border)' }}>
        {[
          { key: 'manual', icon: Keyboard, label: 'Manual Entry' },
          { key: 'camera', icon: Camera, label: 'QR Scanner' },
        ].map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => switchMode(key)} style={{
            flex: 1, padding: '10px', border: 'none', borderRadius: 8,
            background: mode === key ? 'var(--primary-light)' : 'transparent',
            color: mode === key ? 'white' : 'var(--text2)',
            fontWeight: 500, fontSize: 14, transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Manual mode */}
      {mode === 'manual' && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Enter Ticket Code</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="form-input"
              placeholder="Paste ticket code here..."
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && processTicket(manualCode)}
              style={{ fontFamily: 'monospace', fontSize: 13 }}
              autoFocus
            />
            <button className="btn btn-primary" onClick={() => processTicket(manualCode)} disabled={loading || !manualCode.trim()}>
              {loading ? <span className="spinner" /> : 'Check In'}
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>Press Enter or click "Check In" to validate the ticket</p>
        </div>
      )}

      {/* Camera mode */}
      {mode === 'camera' && (
        <div className="card" style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ position: 'relative', background: '#000', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '4/3', marginBottom: 16 }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
            {!scannerActive && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                <QrCode size={48} color="rgba(255,255,255,0.3)" />
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Camera inactive</p>
              </div>
            )}
            {scannerActive && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 200, height: 200, border: '2px solid var(--accent)', borderRadius: 12, boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }} />
              </div>
            )}
          </div>
          {!scannerActive ? (
            <button className="btn btn-primary btn-lg" onClick={startScanner} style={{ width: '100%' }}>
              <Camera size={18} /> Start Camera Scanner
            </button>
          ) : (
            <button className="btn btn-danger btn-lg" onClick={stopScanner} style={{ width: '100%' }}>
              Stop Scanner
            </button>
          )}
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 10 }}>Point the camera at a QR code ticket</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{
          padding: '20px 24px', borderRadius: 'var(--radius)',
          background: result.success ? 'rgba(39,174,96,0.1)' : 'rgba(192,57,43,0.1)',
          border: `1px solid ${result.success ? 'rgba(39,174,96,0.3)' : 'rgba(192,57,43,0.3)'}`,
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }} className="fade-in">
          {result.success
            ? <CheckCircle size={28} color="#27ae60" style={{ flexShrink: 0, marginTop: 2 }} />
            : <XCircle size={28} color="var(--danger-light)" style={{ flexShrink: 0, marginTop: 2 }} />
          }
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: result.success ? '#27ae60' : 'var(--danger-light)', marginBottom: 4 }}>
              {result.success ? 'Check-In Successful!' : 'Check-In Failed'}
            </div>
            <div style={{ color: 'var(--text2)', fontSize: 14 }}>{result.message}</div>
            {result.success && result.full_name && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{result.full_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>{result.email}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>📅 {result.event_title}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
