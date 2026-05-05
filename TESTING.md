# Estratégia de Testes

O objetivo foi cobrir as camadas de teste que aparecem no dia a dia de um time de produto — cada uma com uma proposta diferente, não redundante.

## Camadas

### Integração (`tests/`)

Testam as regras de negócio contra o banco de dados real. A escolha por banco real em vez de mock é intencional: garante que as queries, transações e controle de estoque funcionam de verdade, não apenas que o código compila.

- `health.spec.ts` — saúde da API
- `products.spec.ts` — listagem e busca de produtos
- `cart.spec.ts` — fluxo completo do carrinho com verificação de estado no banco
- `cart-failures.spec.ts` — falhas simuladas com mocks para provar que o ROLLBACK é chamado
- `admin.spec.ts` — autenticação e reset de banco

### E2E (`cypress/`)

Validam o comportamento do sistema pelo olhar do usuário — navegador real, interface real. Cobrem happy path e unhappy path nos fluxos principais do frontend.

### Carga e Concorrência (`k6/`)

Provam que o sistema se comporta corretamente sob pressão: múltiplos usuários simultâneos e pedidos paralelos para o mesmo produto não vendem acima do estoque disponível.

## Decisões

- **Banco isolado para testes:** `vortex_cart_test` separado do banco de desenvolvimento — evita contaminação entre ambientes.
- **`--runInBand`:** execução sequencial no Jest para evitar interferência entre suites.
- **Mock só onde faz sentido:** `cart-failures.spec.ts` usa fake pool/client para simular falha de banco — cenário impossível de testar com banco real de forma confiável.
