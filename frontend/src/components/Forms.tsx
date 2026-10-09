import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DateSelect } from './DateSelect'
import currency from '../assets/Icon/currency.svg'
import { CircleArrowDown, CircleArrowUp } from './asset-icons'
import { graphql } from '../lib/api'
import { amountToCents, today } from '../lib/format'
import type { Category, Transaction } from '../types'
import { useToast } from '../context/Toast'
import { categoryPickerIcons, colors, colorLabels, ErrorMessage, Field, icons, iconLabels, Modal } from './ui'
export function CategoryForm({ item, onClose }: { item?: Category; onClose: () => void }) {
  const [color, setColor] = useState(item?.color ?? 'green')
  const [icon, setIcon] = useState(item?.icon ?? 'briefcase')
  const client = useQueryClient()
  const toast = useToast()
  const mutation = useMutation({ mutationFn: (input: Record<string, unknown>) => graphql(`mutation($input: CategoryInput!${item ? ', $id: ID!' : ''}) { ${item ? 'updateCategory(id: $id, ' : 'createCategory('}input: $input) { id } }`, { input, ...(item ? { id: item.id } : {}) }),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['categories'] }); void client.invalidateQueries({ queryKey: ['transactions'] }); void client.invalidateQueries({ queryKey: ['summary'] }); toast(item ? 'Categoria atualizada!' : 'Categoria criada!'); onClose() } })
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); mutation.mutate({ ...Object.fromEntries(new FormData(event.currentTarget)), color, icon }) }
  return <Modal title={item ? 'Editar categoria' : 'Nova categoria'} description="Organize suas transações com categorias" onClose={onClose}><form onSubmit={submit} className="form-stack category-form">
    <Field label="Título" name="name" placeholder="Ex. Alimentação" defaultValue={item?.name} required maxLength={50} />
    <Field label="Descrição" name="description" placeholder="Descrição da categoria" defaultValue={item?.description} maxLength={160} hint="Opcional" />
    <fieldset className="picker"><legend>Ícone</legend><div className="icon-picker">{[...categoryPickerIcons, ...(categoryPickerIcons.some(key => key === icon) ? [] : [icon as keyof typeof icons])].map(key => { const Icon = icons[key]; return <button key={key} type="button" className={`icon-choice ${icon === key ? 'selected' : ''}`} aria-label={`Ícone ${iconLabels[key]}`} title={iconLabels[key]} aria-pressed={icon === key} onClick={() => setIcon(key)}><Icon size={20} strokeWidth={1.7} /></button> })}</div></fieldset>
    <fieldset className="picker"><legend>Cor</legend><div className="color-picker">{colors.map(value => <button key={value} type="button" aria-label={`Cor ${colorLabels[value]}`} title={colorLabels[value]} aria-pressed={color === value} className={`color-choice tone-${value} ${color === value ? 'selected' : ''}`} onClick={() => setColor(value)}><span /></button>)}</div></fieldset>
    <ErrorMessage error={mutation.error} /><button className="button primary full" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando...' : 'Salvar'}</button>
  </form></Modal>
}
export function TransactionForm({ item, categories, onClose }: { item?: Transaction; categories: Category[]; onClose: () => void }) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(item?.type ?? 'EXPENSE')
  const [error, setError] = useState('')
  const client = useQueryClient()
  const toast = useToast()
  const mutation = useMutation({ mutationFn: (input: Record<string, unknown>) => graphql(`mutation($input: TransactionInput!${item ? ', $id: ID!' : ''}) { ${item ? 'updateTransaction(id: $id, ' : 'createTransaction('}input: $input) { id } }`, { input, ...(item ? { id: item.id } : {}) }),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['transactions'] }); void client.invalidateQueries({ queryKey: ['categories'] }); void client.invalidateQueries({ queryKey: ['summary'] }); toast(item ? 'Transação atualizada!' : 'Transação criada!'); onClose() } })
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>
    const amount = amountToCents(data.amount)
    if (amount === null) { setError('Informe um valor válido, como 125,90, maior que zero.'); return }
    mutation.mutate({ description: data.description, amount, date: data.date, type, categoryId: data.categoryId || null })
  }
  return <Modal title={item ? 'Editar transação' : 'Nova transação'} description="Registre sua despesa ou receita" onClose={onClose}><form className="form-stack transaction-form" onSubmit={submit}>
    <div className="type-picker" role="group" aria-label="Tipo de transação"><button type="button" className={type === 'EXPENSE' ? 'selected expense' : ''} aria-pressed={type === 'EXPENSE'} onClick={() => setType('EXPENSE')}><CircleArrowDown size={16} />Despesa</button><button type="button" className={type === 'INCOME' ? 'selected income' : ''} aria-pressed={type === 'INCOME'} onClick={() => setType('INCOME')}><CircleArrowUp size={16} />Receita</button></div>
    <Field label="Descrição" name="description" placeholder="Ex. Almoço no restaurante" defaultValue={item?.description} required maxLength={160} />
    <div className="form-columns"><DateSelect defaultValue={item?.date ?? today()} /><Field label="Valor" name="amount" placeholder="0,00" inputMode="decimal" icon={<img className="currency-prefix" src={currency} alt="" aria-hidden="true" />} defaultValue={item ? (item.amount / 100).toFixed(2).replace('.', ',') : undefined} required /></div>
    <label className="field"><span>Categoria</span><select aria-label="Categoria" name="categoryId" defaultValue={item?.category?.id ?? ''}><option value="">Selecione</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{!categories.length && <small>Você pode criar categorias na página Categorias.</small>}</label>
    <ErrorMessage error={error || mutation.error} /><button className="button primary full" disabled={mutation.isPending}>{mutation.isPending ? 'Salvando...' : 'Salvar'}</button>
  </form></Modal>
}
export function DeleteDialog({ kind, id, name, onClose }: { kind: 'Category' | 'Transaction'; id: string; name: string; onClose: () => void }) {
  const client = useQueryClient(); const toast = useToast()
  const mutation = useMutation({ mutationFn: () => graphql(`mutation($id: ID!) { delete${kind}(id: $id) }`, { id }), onSuccess: () => { void client.invalidateQueries({ queryKey: ['categories'] }); void client.invalidateQueries({ queryKey: ['transactions'] }); void client.invalidateQueries({ queryKey: ['summary'] }); toast('Registro excluído.'); onClose() } })
  return <Modal title={`Excluir ${kind === 'Category' ? 'categoria' : 'transação'}?`} description={`Você está excluindo “${name}”. ${kind === 'Category' ? 'As transações serão mantidas sem categoria.' : 'Essa ação não pode ser desfeita.'}`} onClose={onClose}><ErrorMessage error={mutation.error} /><div className="modal-actions"><button className="button secondary" disabled={mutation.isPending} onClick={onClose}>Cancelar</button><button className="button destructive" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? 'Excluindo...' : 'Excluir'}</button></div></Modal>
}
