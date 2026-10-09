export const tokenKey = 'financy.token'
export function getToken() { return localStorage.getItem(tokenKey) ?? sessionStorage.getItem(tokenKey) }
export function clearToken() { localStorage.removeItem(tokenKey); sessionStorage.removeItem(tokenKey) }
export function storeToken(token: string, remember: boolean) { clearToken(); (remember ? localStorage : sessionStorage).setItem(tokenKey, token) }
export class ApiError extends Error {
  constructor(message: string, public code?: string) { super(message) }
}
export async function graphql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  let response: Response
  try {
    const token = getToken()
    response = await fetch(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3333/graphql', {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ query, variables }),
    })
  } catch { throw new ApiError('Não foi possível conectar à API. Verifique se o backend está em execução.') }
  if (!response.ok) throw new ApiError('Não foi possível concluir a solicitação. Tente novamente.')
  const result = await response.json()
  if (result.errors?.length) {
    const error = result.errors[0]
    if (error.extensions?.code === 'UNAUTHENTICATED') {
      clearToken()
      window.dispatchEvent(new Event('financy:logout'))
    }
    throw new ApiError(error.message, error.extensions?.code)
  }
  return result.data as T
}
export const userFields = 'id name email avatar'
export const categoryFields = 'id name description color icon transactionCount'
export const transactionFields = `id description amount type date category { ${categoryFields} }`
export const queries = {
  me: `query { me { ${userFields} } }`,
  categories: `query { categories { ${categoryFields} } }`,
  transactions: `query($filter: TransactionFilter, $page: Int, $perPage: Int) { transactions(filter: $filter, page: $page, perPage: $perPage) { items { ${transactionFields} } total page totalPages } }`,
  summary: `query($month: String!) { summary(month: $month) { balance income expense transactionCount categoryCount topCategories { category { ${categoryFields} } amount transactionCount } } }`,
}
