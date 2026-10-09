import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownUp, Pencil, Plus, Tag, Trash2 } from '../components/asset-icons'
import type { Category } from '../types'
import { graphql, queries } from '../lib/api'
import { Badge, CategoryIcon, Empty, ErrorMessage, Loading } from '../components/ui'
import { CategoryForm, DeleteDialog } from '../components/Forms'
export function Categories() {
  const [form, setForm] = useState<Category | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const query = useQuery({ queryKey: ['categories'], queryFn: () => graphql<{ categories: Category[] }>(queries.categories) })
  const data = query.data?.categories ?? []
  const total = data.reduce((sum, category) => sum + category.transactionCount, 0)
  const popular = [...data].sort((a, b) => b.transactionCount - a.transactionCount)[0]
  return <><div className="page-heading"><div><h1>Categorias</h1><p>Organize suas transações por categorias</p></div><button className="button primary" onClick={() => setForm('new')}><Plus size={18} />Nova categoria</button></div>
    <ErrorMessage error={query.error} />{query.error && <button className="button secondary" onClick={() => { void query.refetch() }}>Tentar novamente</button>}
    {query.isPending ? <Loading /> : <><div className="summary-grid category-summary"><div className="summary-card"><Tag size={24} /><div><strong>{data.length}</strong><span>Total de categorias</span></div></div><div className="summary-card"><ArrowDownUp size={24} className="purple" /><div><strong>{total}</strong><span>Total de transações</span></div></div><div className="summary-card">{popular && popular.transactionCount > 0 ? <><span className={`popular-icon tone-${popular.color}`}><CategoryIcon small icon={popular.icon} color={popular.color} /></span><div><strong className="popular-name">{popular.name}</strong><span>Categoria mais utilizada</span></div></> : <><Tag size={24} className="muted" /><div><strong>—</strong><span>Categoria mais utilizada</span></div></>}</div></div>
    {data.length ? <div className="category-grid">{data.map(item => <article className="category-card" key={item.id}><div className="category-card-top"><CategoryIcon color={item.color} icon={item.icon} /><div className="row-actions"><button className="icon-button danger" aria-label={`Excluir ${item.name}`} onClick={() => setDeleting(item)}><Trash2 size={16} /></button><button className="icon-button" aria-label={`Editar ${item.name}`} onClick={() => setForm(item)}><Pencil size={16} /></button></div></div><h2>{item.name}</h2><p>{item.description || 'Sem descrição'}</p><div className="category-card-bottom"><Badge category={item} /><span>{item.transactionCount} {item.transactionCount === 1 ? 'item' : 'itens'}</span></div></article>)}</div> : !query.error && <div className="panel"><Empty title="Crie sua primeira categoria" text="Dê um nome, escolha uma cor e um ícone para organizar suas finanças." action={<button className="button primary" onClick={() => setForm('new')}><Plus size={18} />Nova categoria</button>} /></div>}</>}
    {form && <CategoryForm item={form === 'new' ? undefined : form} onClose={() => setForm(null)} />}{deleting && <DeleteDialog kind="Category" id={deleting.id} name={deleting.name} onClose={() => setDeleting(null)} />}
  </>
}
