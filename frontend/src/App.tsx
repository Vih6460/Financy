import { useEffect } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/Auth'
import { Brand, ErrorMessage, Loading } from './components/ui'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { Categories } from './pages/Categories'
import { Transactions } from './pages/Transactions'
import { Profile } from './pages/Profile'
export function App() {
  const auth = useAuth(); const location = useLocation()
  useEffect(() => { const name = ({ '/': 'Dashboard', '/cadastro': 'Criar conta', '/transacoes': 'Transações', '/categorias': 'Categorias', '/perfil': 'Perfil' } as Record<string, string>)[location.pathname] ?? 'Financy'; document.title = `${auth.user ? name : location.pathname === '/cadastro' ? 'Criar conta' : 'Fazer login'} | Financy` }, [location.pathname, auth.user])
  if (auth.loading) return <main className="auth-page"><Brand /><Loading text="Carregando sua conta..." /></main>
  if (auth.error) return <main className="auth-page"><Brand /><div className="auth-card"><ErrorMessage error={auth.error} /><button className="button primary full" onClick={auth.retry}>Tentar novamente</button><button className="button secondary full" onClick={auth.logout}>Voltar ao login</button></div></main>
  if (!auth.user) return <Routes><Route path="/" element={<AuthPage />} /><Route path="/cadastro" element={<AuthPage key="register" register />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>
  const initials = auth.user.name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()
  return <><a className="skip-link" href="#main">Ir para o conteúdo</a><header className="app-header"><div className="header-inner"><Link to="/" aria-label="Financy início"><Brand compact /></Link><nav aria-label="Navegação principal"><NavLink to="/" end>Dashboard</NavLink><NavLink to="/transacoes">Transações</NavLink><NavLink to="/categorias">Categorias</NavLink></nav><Link className="avatar" to="/perfil" aria-label="Abrir perfil" title={auth.user.name}>{auth.user.avatar ? <img src={auth.user.avatar} alt="" /> : initials}</Link></div></header><main id="main" className="app-main"><Routes><Route path="/" element={<Dashboard />} /><Route path="/transacoes" element={<Transactions />} /><Route path="/categorias" element={<Categories />} /><Route path="/perfil" element={<Profile key={auth.user.id} />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></main></>
}
