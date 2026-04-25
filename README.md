# Vortex Cart API

API de carrinho de compras com controle de estoque. Projeto de estudo com foco em testes automatizados, observabilidade e infraestrutura com Docker.

## O que o projeto faz

O sistema gerencia produtos e um carrinho de compras com as seguintes regras de negócio:

- **Adicionar ao carrinho:** verifica se o produto existe e se há estoque disponível. O inventário é decrementado dentro de uma transação SQL.
- **Remover do carrinho:** devolve a quantidade ao estoque do produto, também dentro de transação.
- **Controle de concorrência:** pedidos simultâneos para o mesmo produto não permitem venda acima do estoque.
- **Catálogo de produtos:** listagem, busca por ID e endpoints administrativos protegidos por API Key.

## Stack

- **Runtime:** Node.js 20
- **Linguagem:** TypeScript
- **Framework:** Fastify 5
- **Banco de dados:** PostgreSQL 15
- **Testes:** Jest + Supertest
- **Documentação:** Swagger/OpenAPI via `@fastify/swagger`
- **Infraestrutura:** Docker Compose (API + PostgreSQL + n8n + ngrok)
- **CI/CD:** GitHub Actions com notificação no Discord via n8n

## Testes

O projeto tem 16 testes automatizados organizados por domínio:

- `health.spec.ts` — verificação de saúde da API
- `products.spec.ts` — listagem e busca de produtos
- `cart.spec.ts` — fluxo completo do carrinho (adicionar, listar, remover, validações, race condition)
- `cart-failures.spec.ts` — testes com mock simulando falhas de banco
- `admin.spec.ts` — autenticação e endpoints administrativos

Os testes de integração usam banco isolado (`vortex_cart_test`) e os testes de falha usam pool mockado com `jest.fn()` para simular erros internos do PostgreSQL.

## Observabilidade

- **Logger estruturado:** Pino (embutido no Fastify) com `pino-pretty` em desenvolvimento e JSON em produção.
- **Error handler global:** erros inesperados são logados com método, URL, requestId e stack trace. O cliente recebe uma mensagem genérica + requestId para rastreamento.
- **Logs no CartService:** erros de banco são logados com contexto estruturado via injeção de dependência do logger.
- **Alertas automáticos:** erros 500 disparam alerta no Discord via n8n com requestId, rota, stack trace e link do repositório.

## Documentação da API

A API possui documentação interativa via Swagger/OpenAPI, acessível em `/docs` com o servidor rodando. As rotas estão organizadas por domínio: Sistema, Admin, Carrinho e Produtos, com schemas de request e response documentados.

## Como rodar

```bash
# Subir todos os serviços
docker compose up --build -d

# Acessar a documentação da API
http://localhost:3000/docs

# Rodar os testes
docker exec vortex-cart-portfolio-vortex-api-1 npm test

# Ver logs em tempo real
docker logs -f vortex-cart-portfolio-vortex-api-1
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
├── helpers/
│   └── db.ts               # Setup compartilhado entre specs
├── health.spec.ts
├── products.spec.ts
├── cart.spec.ts
├── cart-failures.spec.ts
└── admin.spec.ts
```