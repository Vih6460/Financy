import * as Dialog from '@radix-ui/react-dialog'
import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from './asset-icons'
import { currentMonth, monthLabel } from '../lib/format'

const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export function PeriodSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(() => Number((value || currentMonth()).slice(0, 4)))
  const monthButtons = useRef<(HTMLButtonElement | null)[]>([])
  const focusedMonth = Number((value || currentMonth()).slice(5, 7)) - 1

  function choose(period: string) { onChange(period); setOpen(false) }
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 11 : offsets[event.key] !== undefined ? (index + offsets[event.key] + 12) % 12 : null
    if (next !== null) { event.preventDefault(); monthButtons.current[next]?.focus() }
  }

  return <div className="field"><span id="period-label">Período</span><Dialog.Root modal={false} open={open} onOpenChange={next => {
    if (next) setYear(Number((value || currentMonth()).slice(0, 4)))
    setOpen(next)
  }}><div className="period-select"><Dialog.Trigger className="period-trigger" aria-labelledby="period-label period-value"><span id="period-value">{value ? monthLabel(value).replace(' de ', ' / ') : 'Todos os períodos'}</span><ChevronDown size={16} /></Dialog.Trigger>
    <Dialog.Content className="period-popover" aria-describedby={undefined} onOpenAutoFocus={event => { event.preventDefault(); monthButtons.current[focusedMonth]?.focus() }}>
      <Dialog.Title className="sr-only">Selecionar período</Dialog.Title>
      <div className="period-year"><button type="button" className="icon-button" aria-label="Ano anterior" disabled={year <= 1} onClick={() => setYear(year - 1)}><ChevronLeft size={16} /></button><strong aria-live="polite">{year}</strong><button type="button" className="icon-button" aria-label="Próximo ano" disabled={year >= 9999} onClick={() => setYear(year + 1)}><ChevronRight size={16} /></button></div>
      <div className="period-months" role="group" aria-label={`Meses de ${year}`}>{months.map((name, index) => {
        const period = `${String(year).padStart(4, '0')}-${String(index + 1).padStart(2, '0')}`
        return <button type="button" key={name} ref={element => { monthButtons.current[index] = element }} aria-label={`${name} de ${year}`} aria-pressed={value === period} onKeyDown={event => navigate(event, index)} onClick={() => choose(period)}>{name}</button>
      })}</div>
      <div className="period-shortcuts"><button type="button" onClick={() => choose(currentMonth())}>Mês atual</button><button type="button" onClick={() => choose('')}>Todos os períodos</button></div>
    </Dialog.Content>
  </div></Dialog.Root></div>
}
