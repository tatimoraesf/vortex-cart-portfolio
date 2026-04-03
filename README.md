## Descrição
Adiciona um item ao carrinho

## Request Body
product_id (string, obrigatório)
quantity (number, min:1, obrigatório)

## Respostas esperadas
200: sucesso
400: erro de validação de campos
404: produto não encontrado
422: Estoque insuficiente