import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, clearToken, getToken, graphql, queries, storeToken } from '../lib/api'
import type { AuthPayload, User } from '../types'
interface AuthState { user: User | undefined; loading: boolean; error: Error | null; retry: () => void; login: (payload: AuthPayload, remember: boolean) => void; logout: () => void }
const AuthContext = createContext<AuthState | null>(null)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(getToken)
  const client = useQueryClient()
  const me = useQuery({ queryKey: ['me', token], queryFn: () => graphql<{ me: User }>(queries.me), enabled: Boolean(token), retry: (count, error) => !(error instanceof ApiError && error.code === 'UNAUTHENTICATED') && count < 1, staleTime: Infinity })
  const logout = () => { clearToken(); setToken(null); client.clear() }
  useEffect(() => {
    const listener = () => { clearToken(); setToken(null); client.clear() }
    const storageListener = (event: StorageEvent) => { if (event.key === 'financy.token') { setToken(getToken()); client.clear() } }
    window.addEventListener('financy:logout', listener); window.addEventListener('storage', storageListener)
    return () => { window.removeEventListener('financy:logout', listener); window.removeEventListener('storage', storageListener) }
  }, [client])
  const login = (payload: AuthPayload, remember: boolean) => {
    client.clear(); storeToken(payload.token, remember)
    client.setQueryData(['me', payload.token], { me: payload.user }); setToken(payload.token)
  }
  return <AuthContext.Provider value={{ user: token ? me.data?.me : undefined, loading: Boolean(token) && me.isPending, error: token ? me.error : null, retry: () => { void me.refetch() }, login, logout }}>{children}</AuthContext.Provider>
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider ausente'); return value }
