import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { CalendarDays } from 'lucide-react'
import { ChevronLeft, ChevronRight } from './asset-icons'
import { monthLabel, today } from '../lib/format'

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const parseDate = (value: string) => new Date(`${value}T12:00:00Z`)
const serialize = (date: Date) => date.toISOString().slice(0, 10)
const validYear = (date: Date) => date.getUTCFullYear() >= 1 && date.getUTCFullYear() <= 9999
const fullDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeZone: 'UTC' }).format(parseDate(value))

export function DateSelect({ defaultValue }: { defaultValue: string }) {
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const calendar = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<CSSProperties>({})
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(defaultValue.slice(0, 7))
  const [focusedDate, setFocusedDate] = useState(defaultValue)
  const dayButtons = useRef(new Map<string, HTMLButtonElement>())
  const firstDay = parseDate(`${month}-01`)
  const start = new Date(firstDay)
  start.setUTCDate(1 - firstDay.getUTCDay())
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start); date.setUTCDate(start.getUTCDate() + index)
    return { date, key: serialize(date) }
  })

  useLayoutEffect(() => {
    if (!open) return
    function positionCalendar() {
      const rect = trigger.current?.getBoundingClientRect()
      if (!rect) return
      const below = window.innerHeight - rect.bottom - 24
      const above = rect.top - 24
      const height = Math.min((calendar.current?.scrollHeight ?? 378) + 2, window.innerHeight - 32)
      const downward = below >= height || below >= above
      setPosition({ left: Math.max(16, Math.min(rect.left, window.innerWidth - 316)), top: Math.max(16, Math.min(downward ? rect.bottom + 8 : rect.top - height - 8, window.innerHeight - height - 16)), maxHeight: window.innerHeight - 32 })
    }
    positionCalendar()
    window.addEventListener('resize', positionCalendar)
    window.addEventListener('scroll', positionCalendar, true)
    return () => { window.removeEventListener('resize', positionCalendar); window.removeEventListener('scroll', positionCalendar, true) }
  }, [open])
  useEffect(() => { if (open) dayButtons.current.get(focusedDate)?.focus() }, [focusedDate, open])
  function choose(date: string) { setValue(date); setOpen(false) }
  function changeMonth(offset: number) {
    const date = parseDate(`${month}-01`); date.setUTCMonth(date.getUTCMonth() + offset)
    if (validYear(date)) setMonth(serialize(date).slice(0, 7))
  }
  function navigate(event: KeyboardEvent<HTMLButtonElement>, date: string) {
    const next = parseDate(date)
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -next.getUTCDay(), End: 6 - next.getUTCDay() }
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      const day = next.getUTCDate()
      next.setUTCDate(1); next.setUTCMonth(next.getUTCMonth() + (event.key === 'PageUp' ? -1 : 1))
      const end = new Date(next); end.setUTCMonth(end.getUTCMonth() + 1); end.setUTCDate(0)
      next.setUTCDate(Math.min(day, end.getUTCDate()))
    } else if (offsets[event.key] !== undefined) next.setUTCDate(next.getUTCDate() + offsets[event.key])
    else return
    event.preventDefault()
    if (validYear(next)) { const key = serialize(next); setMonth(key.slice(0, 7)); setFocusedDate(key) }
  }

  return <div className="field"><span id={`${id}-label`}>Data</span><input type="hidden" name="date" value={value} /><Dialog.Root modal={false} open={open} onOpenChange={next => {
    if (next) { setMonth(value.slice(0, 7)); setFocusedDate(value) }
    setOpen(next)
  }}><div className="period-select date-select"><Dialog.Trigger ref={trigger} type="button" className="period-trigger" aria-labelledby={`${id}-label ${id}-value`}><span id={`${id}-value`}>{value.split('-').reverse().join('/')}</span><CalendarDays size={16} aria-hidden="true" /></Dialog.Trigger>
    <Dialog.Portal><Dialog.Content ref={calendar} style={position} className="period-popover date-popover" aria-describedby={undefined} onOpenAutoFocus={event => { event.preventDefault(); dayButtons.current.get(value)?.focus() }}>
      <Dialog.Title className="sr-only">Selecionar data</Dialog.Title>
      <div className="period-year"><button type="button" className="icon-button" aria-label="Mês anterior" disabled={month === '0001-01'} onClick={() => changeMonth(-1)}><ChevronLeft size={16} /></button><strong aria-live="polite">{monthLabel(month)}</strong><button type="button" className="icon-button" aria-label="Próximo mês" disabled={month === '9999-12'} onClick={() => changeMonth(1)}><ChevronRight size={16} /></button></div>
      <div className="date-weekdays" aria-hidden="true">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
      <div className="date-days" role="group" aria-label={monthLabel(month)}>{days.map(({ date, key }) => <button type="button" key={key} disabled={!validYear(date)} ref={element => { if (element) dayButtons.current.set(key, element); else dayButtons.current.delete(key) }} className={key.slice(0, 7) !== month ? 'outside-month' : ''} aria-label={validYear(date) ? fullDate(key) : 'Data fora do intervalo'} aria-pressed={key === value} aria-current={key === today() ? 'date' : undefined} tabIndex={key === (focusedDate.slice(0, 7) === month ? focusedDate : `${month}-01`) ? 0 : -1} onFocus={() => setFocusedDate(key)} onKeyDown={event => navigate(event, key)} onClick={() => choose(key)}>{date.getUTCDate()}</button>)}</div>
      <div className="period-shortcuts"><button type="button" onClick={() => choose(today())}>Hoje</button><Dialog.Close type="button">Fechar</Dialog.Close></div>
    </Dialog.Content></Dialog.Portal>
  </div></Dialog.Root></div>
}
