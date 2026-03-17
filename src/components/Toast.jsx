import { CheckCircle, XCircle, Info } from 'lucide-react'

export function Toast({ toast }) {
  if (!toast) return null
  const icons = { success: CheckCircle, error: XCircle, info: Info }
  const Icon = icons[toast.type] || Info
  return (
    <div className={`toast toast-${toast.type}`}>
      <Icon size={18} />
      {toast.message}
    </div>
  )
}
