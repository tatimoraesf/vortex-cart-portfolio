describe('Vortex Cart', () => {
  beforeEach(() => {
    cy.request({
      method: 'POST',
      url: '/admin/reset-db',
      headers: {
        Authorization: `Bearer ${Cypress.env('ADMIN_API_KEY')}`
      }
    })
    cy.visit('/')
  });

  it('deve retornar 400 ao adicionar um produto com quantidade zerada', () => {
    cy.request({
      method: 'POST',
      url: '/cart',
      body: { product_id: '1', quantity: 0 },
      failOnStatusCode: false
    }).then(({ status, body }) => {
      expect(status).to.eq(400)
      expect(body.error).to.eq('body/quantity must be >= 1')
    });
  });

  it('deve retornar 404 ao adicionar um produto inexistente', () => {
    cy.request({
      method: 'POST',
      url: '/cart',
      body: { product_id: '999', quantity: 1 },
      failOnStatusCode: false
    }).then(({ status, body }) => {
      expect(status).to.eq(404)
      expect(body.error).to.eq('Produto não existe no catálogo')
    });
  });

  it('deve retornar 404 ao tentar remover um item inexistente no carrinho', () => {
    cy.request({
      method: 'DELETE',
      url: '/cart/9999',
      failOnStatusCode: false
    }).then(({ status, body }) => {
      expect(status).to.eq(404)
      expect(body.error).to.eq('Item não encontrado no carrinho')
    });
  });

  it('deve retornar 422 ao adicionar mais produtos do que o estoque disponivel', () => {
    cy.request({
      method: 'POST',
      url: '/cart',
      body: { product_id: '1', quantity: 50 },
      failOnStatusCode: false
    }).then(({ status, body }) => {
      expect(status).to.eq(422)
      expect(body.error).to.eq('Estoque insuficiente')
    });
  });

});