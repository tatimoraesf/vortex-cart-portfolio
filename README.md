# 🛒 Vortex Cart API (Estudo de Automação)

Este é um projeto de estudo desenvolvido para praticar **Testes de Integração** e **Lógica de Back-end**. A API simula um carrinho de compras com controle de estoque persistente em banco de dados.

## 🚀 O que o projeto faz?

O sistema gerencia produtos e um carrinho de compras seguindo estas regras de negócio:

* **Adicionar ao Carrinho:** O sistema verifica se o produto existe e se há estoque disponível antes de permitir a adição.
* **Controle de Inventário:** Ao adicionar um item, o estoque do produto diminui automaticamente. Ao remover o item do carrinho, o estoque é devolvido ao catálogo.
* **Persistência de Dados:** Os dados são salvos em um banco de dados SQLite, garantindo que as informações não sejam perdidas ao reiniciar o servidor.

## 🛠️ Tecnologias Utilizadas

* **Node.js**: Ambiente de execução.
* **Fastify**: Framework moderno e rápido para as rotas da API.
* **SQLite**: Banco de Dados relacional para persistência simples.
* **Jest & Supertest**: Ferramentas utilizadas para a criação e execução dos testes automatizados de integração.

## 🧪 Como rodar o projeto

1. Instale as dependências:
```bash
npm install```

2. Para rodar os testes e validar as regras de negócio:
```bash
npx jest

3. Para rodar o servidor em modo de desenvolvimento:
```bash
npm run dev