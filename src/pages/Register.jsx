import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, Mail, Lock, User, AlertCircle, ShieldCheck } from 'lucide-react'

export function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '', role: 'user', adminCode: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const ADMIN_CODE = 'EVENTHUB2024'

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.role === 'admin' && form.adminCode !== ADMIN_CODE) { setError('Invalid admin access code'); return }
    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.fullName, form.role)
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: 480 }} className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={22} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22 }}>EventHub</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>FEU ROOSEVELT</div>
            </div>
          </div>

          <h1 style={{ fontSize: 30, marginBottom: 8 }}>Create account</h1>
          <p style={{ color: 'var(--text2)', marginBottom: 32 }}>Join EventHub to discover and register for campus events</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input className="form-input" name="fullName" placeholder="Juan dela Cruz" value={form.fullName} onChange={handleChange} required style={{ paddingLeft: 40 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required style={{ paddingLeft: 40 }} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input className="form-input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required style={{ paddingLeft: 40 }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input className="form-input" type="password" name="confirm" placeholder="••••••••" value={form.confirm} onChange={handleChange} required style={{ paddingLeft: 40 }} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Type</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['user', 'admin'].map(role => (
                  <label key={role} style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    border: `1px solid ${form.role === role ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.role === role ? 'rgba(201,168,76,0.08)' : 'var(--bg3)',
                    transition: 'all 0.15s',
                  }}>
                    <input type="radio" name="role" value={role} checked={form.role === role} onChange={handleChange} style={{ display: 'none' }} />
                    {role === 'admin' ? <ShieldCheck size={16} color={form.role === role ? 'var(--accent)' : 'var(--text3)'} /> : <User size={16} color={form.role === role ? 'var(--accent)' : 'var(--text3)'} />}
                    <span style={{ fontSize: 14, fontWeight: 500, color: form.role === role ? 'var(--accent)' : 'var(--text2)', textTransform: 'capitalize' }}>{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {form.role === 'admin' && (
              <div className="form-group">
                <label className="form-label">Admin Access Code</label>
                <input className="form-input" name="adminCode" placeholder="Enter admin code" value={form.adminCode} onChange={handleChange} />
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>Contact your institution for the admin code</span>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 'var(--radius-sm)', color: '#e57373', fontSize: 13 }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text2)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>

      <div style={{
        width: '40%', background: 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(201,168,76,0.08) 0%, transparent 60%)' }} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎟️</div>
          <h2 style={{ fontSize: 26, color: 'white', marginBottom: 16 }}>Your Campus<br/>Ticket Hub</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 260 }}>
            Get a QR-coded ticket instantly after registering for any event.
          </p>
        </div>
      </div>
    </div>
  )
}
