export interface User { id: string; name: string; email: string; avatar: string | null }
export interface Category { id: string; name: string; description: string; color: string; icon: string; transactionCount: number }
export interface Transaction { id: string; description: string; amount: number; type: 'INCOME' | 'EXPENSE'; date: string; category: Category | null }
export interface TransactionPage { items: Transaction[]; total: number; page: number; totalPages: number }
export interface Summary { balance: number; income: number; expense: number; transactionCount: number; categoryCount: number; topCategories: { category: Category; amount: number; transactionCount: number }[] }
export interface AuthPayload { token: string; user: User }
