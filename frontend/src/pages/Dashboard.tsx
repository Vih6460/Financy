import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Wallet, CircleArrowDown, CircleArrowUp, ChevronRight, Plus } from '../components/asset-icons'
import { graphql, queries } from '../lib/api'
import { currentMonth, money, monthLabel } from '../lib/format'
import type { Category, Summary, TransactionPage } from '../types'
import { Badge, CategoryIcon, Empty, ErrorMessage, Loading } from '../components/ui'
import { TransactionForm } from '../components/Forms'
export function Dashboard() {
  const month = currentMonth()
  const [creating, setCreating] = useState(false)
  const summary = useQuery({ queryKey: ['summary', month], queryFn: () => graphql<{ summary: Summary }>(queries.summary, { month }) })
  const transactions = useQuery({ queryKey: ['transactions', 'recent'], queryFn: () => graphql<{ transactions: TransactionPage }>(queries.transactions, { page: 1, perPage: 5 }) })
  const categories = useQuery({ queryKey: ['categories'], queryFn: () => graphql<{ categories: Category[] }>(queries.categories) })
  const error = summary.error || transactions.error || categories.error
  if (summary.isPending || transactions.isPending || categories.isPending) return <Loading />
  if (error) return <div><ErrorMessage error={error} /><button className="button secondary" onClick={() => { void summary.refetch(); void transactions.refetch(); void categories.refetch() }}>Tentar novamente</button></div>
  const data = summary.data!.summary
  return <><h1 className="sr-only">Dashboard</h1><div className="summary-grid"><div className="summary-card"><span><Wallet size={20} className="purple" />Saldo total</span><strong>{money(data.balance)}</strong></div><div className="summary-card" title={monthLabel(month)}><span><CircleArrowUp size={20} className="green" />Receitas do mês</span><strong>{money(data.income)}</strong></div><div className="summary-card" title={monthLabel(month)}><span><CircleArrowDown size={20} className="red" />Despesas do mês</span><strong>{money(data.expense)}</strong></div></div>
    <div className="dashboard-grid"><section className="panel recent-panel"><div className="panel-heading"><h2>Transações recentes</h2><Link to="/transacoes">Ver todas <ChevronRight size={16} /></Link></div>
      {!transactions.data!.transactions.items.length ? <Empty title="Suas finanças começam aqui" text="Registre sua primeira transação para acompanhar suas entradas e saídas." /> : <div className="recent-list">{transactions.data!.transactions.items.map(item => <div key={item.id} className="recent-row"><div className="transaction-description"><CategoryIcon icon={item.category?.icon ?? 'wallet'} color={item.category?.color ?? 'gray'} /><div><strong>{item.description}</strong><span>{item.date.split('-').reverse().map((part, index) => index === 2 ? part.slice(-2) : part).join('/')}</span></div></div><Badge category={item.category} /><span className="recent-amount">{item.type === 'INCOME' ? '+' : '-'} {money(item.amount)}{item.type === 'INCOME' ? <CircleArrowUp className="green" size={16} /> : <CircleArrowDown className="red" size={16} />}</span></div>)}</div>}
      <button className="panel-footer" onClick={() => setCreating(true)}><Plus size={18} />Nova transação</button></section>
    <section className="panel dashboard-categories"><div className="panel-heading"><h2>Categorias</h2><Link to="/categorias">Gerenciar <ChevronRight size={16} /></Link></div>{data.topCategories.length ? <div className="category-totals">{data.topCategories.map(item => <div key={item.category.id}><Badge category={item.category} /><span>{item.transactionCount} {item.transactionCount === 1 ? 'item' : 'itens'}</span><strong>{money(item.amount)}</strong></div>)}</div> : <Empty title="Tudo organizado" text="As despesas por categoria deste mês aparecerão aqui." action={<Link className="text-link" to="/categorias">Gerenciar categorias</Link>} />}</section></div>
    {creating && <TransactionForm categories={categories.data!.categories} onClose={() => setCreating(false)} />}
  </>
}
