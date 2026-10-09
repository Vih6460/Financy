# Frontend Financy

React + TypeScript + Vite, React Router, TanStack Query, Radix Dialog e Lucide. Consultas e mutações usam exclusivamente o endpoint GraphQL, através de `src/lib/api.ts`.

Consulte o [README da raiz](../README.md) para executar os dois projetos. Configure `VITE_BACKEND_URL` usando `.env.example`. A fonte Inter é instalada como dependência e servida localmente. O tema e os estilos responsivos ficam em `src/styles.css`.

As seis telas ficam em `src/pages`; os formulários compartilhados de categorias e transações ficam em `src/components/Forms.tsx`. Dados e totais são consultados da API. O cache é atualizado após as mutações e limpo ao encerrar a sessão ou trocar a conta.

O logotipo e os ícones SVG originais ficam em `src/assets`. `src/components/asset-icons.tsx` usa os arquivos sem alterar seu conteúdo, aplica as cores do tema por máscaras CSS e preserva as proporções. Os ícones de categoria incluem investimentos, estudos, entretenimento e serviços. Lucide complementa os controles e as categorias sem SVG correspondente.
