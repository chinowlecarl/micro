import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { Toast } from '../../components/Toast'
import { Save, ArrowLeft } from 'lucide-react'

const defaultForm = { title: '', description: '', location: '', event_date: '', event_time: '', capacity: 50, status: 'draft' }

export function EventForm() {
  const { id } = useParams()
  const isEdit = !!id
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { toast, showToast } = useToast()

  useEffect(() => {
    if (isEdit) {
      supabase.from('events').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setForm(data)
        setFetching(false)
      })
    }
  }, [id])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, capacity: parseInt(form.capacity) }

    let error
    if (isEdit) {
      ({ error } = await supabase.from('events').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id))
    } else {
      ({ error } = await supabase.from('events').insert({ ...payload, created_by: profile.id }))
    }

    setLoading(false)
    if (error) { showToast(error.message, 'error'); return }
    showToast(isEdit ? 'Event updated!' : 'Event created!', 'success')
    setTimeout(() => navigate('/admin/events'), 1000)
  }

  if (fetching) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>

  return (
    <div className="fade-in" style={{ maxWidth: 860 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={() => navigate('/admin/events')} className="btn btn-ghost btn-sm"><ArrowLeft size={16} /></button>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 2 }}>{isEdit ? 'Edit Event' : 'Create a new Event'}</h1>
          <p style={{ color: 'var(--text2)' }}>Fill in the details to publish a new activity for SJC students.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* General Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            <h2 style={{ fontSize: 17 }}>General Information</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 160px', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" name="title" placeholder="Event title" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-input" type="date" name="event_date" value={form.event_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <input className="form-input" type="time" name="event_time" value={form.event_time} onChange={handleChange} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 200px', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input className="form-input" name="location" placeholder="e.g. Computer Laboratory 1" value={form.location} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity *</label>
                <input className="form-input" type="number" name="capacity" min="1" value={form.capacity} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            <h2 style={{ fontSize: 17 }}>Description</h2>
          </div>
          <textarea
            className="form-input"
            name="description"
            placeholder="Describe the event..."
            value={form.description}
            onChange={handleChange}
            rows={6}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-accent btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : <><Save size={16} /> {isEdit ? 'Update Event' : 'Create Event'}</>}
          </button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate('/admin/events')}>Cancel</button>
        </div>
      </form>
      <Toast toast={toast} />
    </div>
  )
}
