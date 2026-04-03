# Especificação do Projeto Vortex Cart

## O que é
API de E-commerce simulando um carrinho de compras com:
- Catálogo de produtos
- Gerenciamento de estoque
- Cálculo de frete
- Webhooks de pagamento

## Por que esse projeto
Porque testa cenários reais que o mercado cobra:
- Concorrência (dois clientes comprando o último produto)
- Regras de negócio (cupom de desconto, frete grátis)
- Integrações (webhooks, APIs externas)

Um "to-do list" não cobre isso.

## Fases de construção

| Fase | O que vou construir | O que vou testar |
|---|---|---|
| 1. Fundamentos | 3 rotas básicas (listar, adicionar, consultar) | Testes de integração com Jest |
| 2. Automação API | Regras de negócio completas | Suite completa (happy/sad path) |
| 3. Automação Web | Interface simples | Testes E2E com Cypress |
| 4. Containers | Docker do projeto | Ambiente isolado |
| 5. CI/CD | Pipeline de testes | GitHub Actions |
| 6. Documentação | README profissional | - |

## Tecnologias

**Backend:**
- Node.js + Fastify (API rápida e moderna)
- SQLite (banco simples, sem config)
- TypeScript (tipagem ajuda a evitar erros)

**Testes:**
- Jest (framework de testes)
- Supertest (testa rotas HTTP)
- Cypress ou Playwright (testes E2E)

**Infra:**
- Docker (ambiente padronizado)
- GitHub Actions (CI/CD gratuito)

## Estrutura final esperada
```
vortex-cart/
├── src/
│   ├── server.ts          # Servidor principal
│   ├── routes/            # Rotas da API
│   └── database/          # Conexão com SQLite
├── tests/
│   ├── integration/       # Testes de API
│   └── e2e/              # Testes de interface
├── docs/
│   └── api.md            # Documentação das rotas
├── .github/
│   └── workflows/        # CI/CD
├── README.md
├── package.json
└── docker-compose.yml
```

## Critério de "portfólio pronto"

✅ Roda do zero só com `npm install && npm start`  
✅ Testes passam com `npm test`  
✅ README explica cada decisão técnica  
✅ Commits organizados com mensagens claras  
✅ Posso apresentar em entrevista sem gaguejar