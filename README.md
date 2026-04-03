🛒 Vortex Cart API (Estudo de Automação)
Este é um projeto de estudo desenvolvido para praticar Testes de Integração e Lógica de Back-end. A API simula um carrinho de compras com controle de estoque persistente em banco de dados.

🚀 O que o projeto faz?
O sistema gerencia produtos e um carrinho de compras seguindo estas regras:

Adicionar ao Carrinho: O sistema verifica se o produto existe e se há estoque disponível antes de adicionar.

Controle de Inventário: Ao adicionar um item, o estoque do produto diminui. Ao remover, o estoque é devolvido automaticamente.

Persistência: Os dados não somem ao reiniciar o servidor, pois são salvos em um banco de dados SQLite.

🛠️ Tecnologias Utilizadas
Node.js com Fastify (Framework para as rotas da API).

SQLite (Banco de Dados).

Jest e Supertest (Ferramentas para os testes automatizados).

🧪 Como rodar os testes
Para garantir que todas as regras de negócio estão funcionando, execute:

Bash
npm install
npx jest