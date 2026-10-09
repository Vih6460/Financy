import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { X } from '../components/asset-icons'
const Context = createContext<(text: string) => void>(() => {})
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const toast = useCallback((text: string) => setMessage(text), [])
  useEffect(() => { if (!message) return; const timeout = setTimeout(() => setMessage(''), 4500); return () => clearTimeout(timeout) }, [message])
  return <Context.Provider value={toast}>{children}<div className="toast-region" aria-live="polite">{message && <div className="toast"><CheckCircle2 size={20} />{message}<button className="icon-button" aria-label="Fechar notificação" onClick={() => setMessage('')}><X size={16} /></button></div>}</div></Context.Provider>
}
export const useToast = () => useContext(Context)
