import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, LockKeyhole, UserRound, Eye, EyeOff, LogIn, UserRoundPlus } from '../components/asset-icons'
import { useMutation } from '@tanstack/react-query'
import { graphql, userFields } from '../lib/api'
import { useAuth } from '../context/Auth'
import type { AuthPayload } from '../types'
import { Brand, ErrorMessage, Field } from '../components/ui'
export function AuthPage({ register = false }: { register?: boolean }) {
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()
  const mutation = useMutation({ mutationFn: (input: Record<string, string>) => graphql<Record<string, AuthPayload>>(`mutation($input: ${register ? 'RegisterInput' : 'LoginInput'}!) { ${register ? 'register' : 'login'}(input: $input) { token user { ${userFields} } } }`, { input }),
    onSuccess: data => { auth.login(data[register ? 'register' : 'login'], remember); navigate('/', { replace: true }) } })
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>
    mutation.mutate(values)
  }
  return <main className="auth-page"><Link to="/" className="auth-brand" aria-label="Financy início"><Brand /></Link><section className="auth-card"><h1>{register ? 'Criar conta' : 'Fazer login'}</h1><p className="auth-subtitle">{register ? 'Comece a controlar suas finanças ainda hoje' : 'Entre na sua conta para continuar'}</p><form onSubmit={submit} className="form-stack">
    {register && <Field label="Nome completo" name="name" placeholder="Seu nome completo" icon={<UserRound size={16} />} autoComplete="name" required minLength={2} maxLength={80} />}
    <Field label="E-mail" name="email" type="email" placeholder="mail@exemplo.com" icon={<Mail size={16} />} autoComplete="email" required maxLength={254} />
    <label className="field"><span>Senha</span><span className="input-wrap with-icon password-wrap"><LockKeyhole size={16} /><input name="password" type={showPassword ? 'text' : 'password'} placeholder="Digite sua senha" autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 8 : 1} maxLength={128} required /><button type="button" className="password-toggle" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Eye size={16} /> : <EyeOff size={16} />}</button></span>{register && <small>A senha deve ter no mínimo 8 caracteres</small>}</label>
    {!register && <label className="checkbox"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} />Lembrar-me</label>}
    <ErrorMessage error={mutation.error} /><button className="button primary full" disabled={mutation.isPending}>{mutation.isPending ? 'Aguarde...' : register ? 'Cadastrar' : 'Entrar'}</button>
  </form><div className="divider"><span>ou</span></div><p className="auth-switch">{register ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}</p><Link className="button secondary full" to={register ? '/' : '/cadastro'}>{register ? <LogIn size={18} /> : <UserRoundPlus size={18} />}{register ? 'Fazer login' : 'Criar conta'}</Link></section></main>
}
