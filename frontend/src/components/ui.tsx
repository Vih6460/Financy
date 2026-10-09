import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import type { ReactNode, InputHTMLAttributes } from 'react'
import { GraduationCap, Gamepad2, Plane, Coffee, Smartphone, LoaderCircle, CircleAlert } from 'lucide-react'
import { BriefcaseBusiness, Utensils, ShoppingCart, House, Car, Heart, Gift, Wallet, PawPrint, Dumbbell, Tag, X, CircleArrowDown, CircleArrowUp, Pencil, Trash2, BaggageClaim, BookOpen, Mailbox, PiggyBank, ReceiptText, Ticket, ToolCase } from './asset-icons'
import logo from '../assets/Logo.svg'
import type { Category, Transaction } from '../types'
import { dateLabel, money } from '../lib/format'
export const icons = { briefcase: BriefcaseBusiness, utensils: Utensils, 'shopping-cart': ShoppingCart, home: House, car: Car, heart: Heart, 'graduation-cap': GraduationCap, gamepad: Gamepad2, plane: Plane, gift: Gift, wallet: Wallet, coffee: Coffee, smartphone: Smartphone, 'paw-print': PawPrint, dumbbell: Dumbbell, tag: Tag, 'baggage-claim': BaggageClaim, 'book-open': BookOpen, mailbox: Mailbox, 'piggy-bank': PiggyBank, 'receipt-text': ReceiptText, ticket: Ticket, 'tool-case': ToolCase }
export const categoryPickerIcons = ['briefcase', 'car', 'heart', 'piggy-bank', 'shopping-cart', 'ticket', 'tool-case', 'utensils', 'paw-print', 'home', 'gift', 'dumbbell', 'book-open', 'baggage-claim', 'mailbox', 'receipt-text'] as const
export const colors = ['green', 'blue', 'purple', 'pink', 'red', 'orange', 'yellow']
export const iconLabels: Record<string, string> = { briefcase: 'Trabalho', utensils: 'Alimentação', 'shopping-cart': 'Compras', home: 'Casa', car: 'Transporte', heart: 'Saúde', 'graduation-cap': 'Educação', gamepad: 'Lazer', plane: 'Viagem', gift: 'Presente', wallet: 'Carteira', coffee: 'Café', smartphone: 'Celular', 'paw-print': 'Animais', dumbbell: 'Exercício', tag: 'Etiqueta', 'baggage-claim': 'Bagagem', 'book-open': 'Estudos', mailbox: 'Correspondência', 'piggy-bank': 'Investimentos', 'receipt-text': 'Contas', ticket: 'Entretenimento', 'tool-case': 'Serviços' }
export const colorLabels: Record<string, string> = { green: 'Verde', blue: 'Azul', purple: 'Roxo', pink: 'Rosa', red: 'Vermelho', orange: 'Laranja', yellow: 'Amarelo' }
export function CategoryIcon({ icon, color, small = false }: { icon: string; color: string; small?: boolean }) {
  const Icon = icons[icon as keyof typeof icons] ?? Tag
  return <span className={`category-icon tone-${color} ${small ? 'small' : ''}`}><Icon size={16} strokeWidth={1.7} /></span>
}
export function Brand({ compact = false }: { compact?: boolean }) { return <span className={`brand ${compact ? 'brand-compact' : ''}`}><img src={logo} width={134} height={32} alt="Financy" /></span> }
export function Badge({ category }: { category: Category | null }) { return <span className={`badge ${category ? `tone-${category.color}` : 'tone-gray'}`}>{category?.name ?? 'Sem categoria'}</span> }
export function Field({ label, hint, icon, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; icon?: ReactNode }) {
  return <label className="field"><span>{label}</span><span className={`input-wrap ${icon ? 'with-icon' : ''}`}>{icon}<input {...props} /></span>{hint && <small>{hint}</small>}</label>
}
export function ErrorMessage({ error }: { error?: Error | string | null }) { return error ? <div className="error-message" role="alert"><CircleAlert size={18} /><span>{typeof error === 'string' ? error : error.message}</span></div> : null }
export function Loading({ text = 'Carregando...' }: { text?: string }) { return <div className="loading" role="status"><LoaderCircle className="spin" size={22} />{text}</div> }
export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) { return <div className="empty"><span className="empty-icon"><Wallet size={27} /></span><h3>{title}</h3><p>{text}</p>{action}</div> }
export function Modal({ title, description, children, onClose }: { title: string; description: string; children: ReactNode; onClose: () => void }) {
  const [previousFocus] = useState(() => document.activeElement as HTMLElement | null)
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose() }}><Dialog.Portal><Dialog.Overlay className="modal-overlay" /><Dialog.Content className="modal" onCloseAutoFocus={event => { event.preventDefault(); previousFocus?.focus() }}><div className="modal-heading"><div><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description></div><Dialog.Close className="icon-button" aria-label="Fechar formulário"><X size={16} /></Dialog.Close></div>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>
}
export function TransactionRow({ item, onEdit, onDelete }: { item: Transaction; onEdit?: () => void; onDelete?: () => void }) {
  const income = item.type === 'INCOME'
  return <tr><td><div className="transaction-description"><CategoryIcon icon={item.category?.icon ?? 'wallet'} color={item.category?.color ?? 'gray'} /><strong>{item.description}</strong></div></td><td><span className="muted">{dateLabel(item.date)}</span></td><td><Badge category={item.category} /></td><td><span className={`transaction-type ${income ? 'income' : 'expense'}`}>{income ? <CircleArrowUp size={16} /> : <CircleArrowDown size={16} />}{income ? 'Entrada' : 'Saída'}</span></td><td className="amount">{income ? '+' : '-'} {money(item.amount)}</td>{onEdit && <td><div className="row-actions"><button className="icon-button danger" aria-label={`Excluir ${item.description}`} onClick={onDelete}><Trash2 size={16} /></button><button className="icon-button" aria-label={`Editar ${item.description}`} onClick={onEdit}><Pencil size={16} /></button></div></td>}</tr>
}
