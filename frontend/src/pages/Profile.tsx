import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload } from 'lucide-react'
import { LogOut, UserRound, Mail, Trash2 } from '../components/asset-icons'
import { useAuth } from '../context/Auth'
import { useToast } from '../context/Toast'
import { graphql, userFields } from '../lib/api'
import type { User } from '../types'
import { ErrorMessage, Field } from '../components/ui'
export function Profile() {
  const { user, logout } = useAuth(); const toast = useToast(); const client = useQueryClient()
  const [avatar, setAvatar] = useState<string | null | undefined>(undefined); const [error, setError] = useState('')
  const mutation = useMutation({ mutationFn: (input: { name: string; avatar?: string | null }) => graphql<{ updateProfile: User }>(`mutation($name: String!, $avatar: String) { updateProfile(name: $name, avatar: $avatar) { ${userFields} } }`, input),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['me'] }); toast('Perfil atualizado!') } })
  function upload(event: ChangeEvent<HTMLInputElement>) {
    setError(''); const file = event.target.files?.[0]; if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) { setError('Escolha uma imagem PNG, JPEG ou WebP de até 2 MB.'); event.target.value = ''; return }
    const reader = new FileReader(); reader.onload = () => setAvatar(reader.result as string); reader.onerror = () => setError('Não foi possível ler a imagem.'); reader.readAsDataURL(file)
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const name = String(new FormData(event.currentTarget).get('name')); mutation.mutate({ name, ...(avatar === undefined ? {} : { avatar }) }) }
  const image = avatar === undefined ? user!.avatar : avatar
  return <><h1 className="sr-only">Perfil</h1><section className="panel profile-card"><form className="form-stack" onSubmit={submit}><div className="profile-identity"><div className="profile-avatar-section"><div className="avatar large">{image ? <img src={image} alt="Sua foto de perfil" /> : <span>{user!.name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}</span>}</div><div><label className="button secondary upload-button" title="PNG, JPEG ou WebP. Máximo de 2 MB."><Upload size={14} />Alterar foto<input type="file" accept="image/png,image/jpeg,image/webp" aria-label="Alterar foto de perfil" onChange={upload} /></label>{image && <button type="button" className="text-link danger" onClick={() => setAvatar(null)}><Trash2 size={14} />Remover foto</button>}</div></div><h2>{user!.name}</h2><p>{user!.email}</p></div><Field name="name" label="Nome completo" icon={<UserRound size={16} />} defaultValue={user!.name} required minLength={2} maxLength={80} autoComplete="name" /><Field name="email" label="E-mail" icon={<Mail size={16} />} value={user!.email} disabled hint="O e-mail não pode ser alterado" /><ErrorMessage error={error || mutation.error} /><button className="button primary full" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando...' : 'Salvar alterações'}</button></form><div className="profile-footer"><button className="button secondary full" onClick={logout}><LogOut size={18} />Sair da conta</button></div></section></>
}
