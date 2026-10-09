import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import { ChevronLeft, ChevronRight, Plus, Search } from '../components/asset-icons'
import { graphql, queries } from '../lib/api'
import type { Category, Transaction, TransactionPage } from '../types'
import { currentMonth } from '../lib/format'
import { Empty, ErrorMessage, Loading, TransactionRow } from '../components/ui'
import { PeriodSelect } from '../components/PeriodSelect'
import { DeleteDialog, TransactionForm } from '../components/Forms'
export function Transactions() {
  const [search, setSearch] = useState(''); const [debounced, setDebounced] = useState('')
  const [month, setMonth] = useState(currentMonth); const [type, setType] = useState(''); const [categoryId, setCategoryId] = useState(''); const [page, setPage] = useState(1)
  const [form, setForm] = useState<Transaction | 'new' | null>(null); const [deleting, setDeleting] = useState<Transaction | null>(null)
  useEffect(() => { const timeout = setTimeout(() => { setDebounced(search); setPage(1) }, 300); return () => clearTimeout(timeout) }, [search])
  const filter = { search: debounced || null, month: month || null, type: type || null, categoryId: categoryId || null }
  const query = useQuery({ queryKey: ['transactions', filter, page], queryFn: () => graphql<{ transactions: TransactionPage }>(queries.transactions, { filter, page, perPage: 10 }) })
  const categories = useQuery({ queryKey: ['categories'], queryFn: () => graphql<{ categories: Category[] }>(queries.categories) })
  const entries = query.data?.transactions
  // A deletion can remove the last row of the current page.
  useEffect(() => { if (entries && page > entries.totalPages) setPage(entries.totalPages) }, [entries, page])
  function reset() { setSearch(''); setDebounced(''); setMonth(''); setType(''); setCategoryId(''); setPage(1) }
  return <><div className="page-heading"><div><h1>Transações</h1><p>Gerencie todas as suas transações financeiras</p></div><button className="button primary" onClick={() => setForm('new')}><Plus size={18} />Nova transação</button></div>
    <section className="panel filters" aria-label="Filtros de transações"><label className="field search-field"><span>Buscar</span><span className="input-wrap with-icon"><Search size={18} /><input placeholder="Buscar por descrição" value={search} onChange={e => setSearch(e.target.value)} maxLength={160} /></span></label><label className="field"><span>Tipo</span><select aria-label="Tipo" value={type} onChange={e => { setType(e.target.value); setPage(1) }}><option value="">Todos</option><option value="INCOME">Entrada</option><option value="EXPENSE">Saída</option></select></label><label className="field"><span>Categoria</span><select aria-label="Categoria" value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1) }}><option value="">Todas</option>{categories.data?.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><PeriodSelect value={month} onChange={value => { setMonth(value); setPage(1) }} /></section>
    <ErrorMessage error={query.error || categories.error} />{query.error && <button className="button secondary" onClick={() => { void query.refetch() }}>Tentar novamente</button>}
    <section className="panel transactions-panel">{query.isPending ? <Loading /> : entries?.items.length ? <><div className="table-scroll"><table><thead><tr><th>Descrição</th><th>Data</th><th>Categoria</th><th>Tipo</th><th className="amount">Valor</th><th className="actions-heading">Ações</th></tr></thead><tbody>{entries.items.map(item => <TransactionRow key={item.id} item={item} onEdit={() => setForm(item)} onDelete={() => setDeleting(item)} />)}</tbody></table></div><div className="pagination"><span>{(page - 1) * 10 + 1} a {Math.min(page * 10, entries.total)} de {entries.total} resultados</span><div className="pagination-pages"><button className="icon-button" disabled={page <= 1} aria-label="Página anterior" onClick={() => setPage(page - 1)}><ChevronLeft size={18} /></button>{Array.from(new Set([1, page - 1, page, page + 1, entries.totalPages].filter(value => value >= 1 && value <= entries.totalPages))).sort((a, b) => a - b).map((value, index, pages) => <span className="pagination-slot" key={value}>{index > 0 && value > pages[index - 1] + 1 && <span aria-hidden="true">…</span>}<button className="icon-button pagination-page" aria-label={`Página ${value}`} aria-current={value === page ? 'page' : undefined} onClick={() => setPage(value)}>{value}</button></span>)}<button className="icon-button" disabled={page >= entries.totalPages} aria-label="Próxima página" onClick={() => setPage(page + 1)}><ChevronRight size={18} /></button></div></div></> : !query.error && <Empty title="Nenhuma transação encontrada" text="Crie uma transação ou ajuste os filtros para ver seus registros." action={<button className="button secondary" onClick={reset}><SlidersHorizontal size={18} />Limpar filtros</button>} />}</section>
    {form && <TransactionForm item={form === 'new' ? undefined : form} categories={categories.data?.categories ?? []} onClose={() => setForm(null)} />}{deleting && <DeleteDialog kind="Transaction" id={deleting.id} name={deleting.description} onClose={() => setDeleting(null)} />}
  </>
}
