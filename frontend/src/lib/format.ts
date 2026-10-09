export const money = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
export const dateLabel = (date: string) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', year: '2-digit', month: '2-digit', day: '2-digit' }).format(new Date(`${date}T12:00:00Z`))
export function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
export const currentMonth = () => today().slice(0, 7)
export const monthLabel = (month: string) => new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T12:00:00Z`))
export function amountToCents(value: string) {
  const normalized = value.trim().replace(/\s|R\$/g, '')
  if (!/^\d+(,\d{1,2})?$/.test(normalized)) return null
  const [whole, fraction = ''] = normalized.split(',')
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(result) && result > 0 && result <= 2_000_000_000 ? result : null
}
