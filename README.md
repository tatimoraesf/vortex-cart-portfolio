# Vortex Cart

API de carrinho com interface web, 20 testes automatizados (integração + E2E), observabilidade com Pino e pipeline de CI/CD completo com notificações no Discord.

## O que o projeto faz

O sistema gerencia produtos e um carrinho de compras com as seguintes regras de negócio:

- **Adicionar ao carrinho:** verifica se o produto existe e se há estoque disponível. O inventário é decrementado dentro de uma transação SQL.
- **Remover do carrinho:** devolve a quantidade ao estoque do produto, também dentro de transação.
- **Controle de concorrência:** pedidos simultâneos para o mesmo produto não permitem venda acima do estoque.
- **Catálogo de produtos:** listagem, busca por ID e endpoints administrativos protegidos por API Key.
- **Frontend:** interface dark e moderna servida pelo próprio Fastify, com listagem de produtos, carrinho em tempo real e feedback visual de estoque.

## Stack

- **Runtime:** Node.js 20
- **Linguagem:** TypeScript
- **Framework:** Fastify 5
- **Banco de dados:** PostgreSQL 15
- **Testes de integração:** Jest + Supertest
- **Testes E2E:** Cypress 15
- **Documentação:** Swagger/OpenAPI via `@fastify/swagger`
- **Infraestrutura:** Docker Compose (API + PostgreSQL + n8n + ngrok)
- **CI/CD:** GitHub Actions com dois jobs paralelos (integração + E2E) e notificação no Discord via n8n

## Testes de integração

16 testes organizados por domínio, rodando em banco isolado (`vortex_cart_test`):

- `health.spec.ts` — verificação de saúde da API
- `products.spec.ts` — listagem e busca de produtos
- `cart.spec.ts` — fluxo completo do carrinho (adicionar, listar, remover, validações)
- `cart-failures.spec.ts` — falhas de banco simuladas com `jest.fn()` — prova que ROLLBACK funciona
- `admin.spec.ts` — autenticação e endpoints administrativos

## Testes E2E

4 testes Cypress cobrindo os fluxos principais do frontend:

- Exibição da lista de produtos
- Adicionar produto ao carrinho
- Remover produto do carrinho
- Botão desabilitado quando estoque está zerado

Os testes resetam o banco via `POST /admin/reset-db` no `beforeEach` — garantindo isolamento entre os testes.

## Observabilidade

- **Logger estruturado:** Pino com `pino-pretty` em desenvolvimento e JSON em produção.
- **Error handler global:** erros inesperados são logados com método, URL, requestId e stack trace. O cliente recebe mensagem genérica + requestId para rastreamento.
- **Alertas automáticos:** erros 500 disparam alerta no Discord via n8n com requestId, rota, stack trace e link do repositório.

## Documentação da API

Documentação interativa via Swagger/OpenAPI disponível em `/docs` com o servidor rodando. Rotas organizadas por domínio: Sistema, Admin, Carrinho e Produtos.

## Como rodar

```bash
# Subir todos os serviços (API + banco + n8n + ngrok)
docker compose up --build -d

# Acessar o frontend
http://localhost:3000

# Acessar a documentação da API
http://localhost:3000/docs

# Rodar os testes de integração
npm test

# Rodar os testes E2E
npx cypress open
```

## Estrutura do projeto

```
src/
├── routes/
│   ├── adminRoutes.ts      # Endpoints administrativos (protegidos por API Key)
│   ├── cartRoutes.ts       # Endpoints do carrinho
│   └── productRoutes.ts    # Catálogo de produtos
├── services/
│   ├── CartService.ts      # Transações SQL, controle de estoque
│   └── ProductService.ts   # Consultas de produtos
├── database.ts             # Pool PostgreSQL + criação de tabelas
└── server.ts               # Factory do servidor, logger Pino, error handler global

tests/
├── helpers/db.ts           # Setup compartilhado entre specs
├── health.spec.ts
├── products.spec.ts
├── cart.spec.ts
├── cart-failures.spec.ts
└── admin.spec.ts

cypress/
└── e2e/
    └── spec.cy.ts          # Testes E2E do frontend

index.html                  # Frontend
app.js                      # Lógica do frontend
style.css                   # Estilos
```