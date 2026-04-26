describe('Vortex Cart', () => {
  beforeEach(() => {
    cy.visit('/')
  });
  it('deve exibir a lista de produtos', () => {
    cy.get('.product-card').should('have.length.at.least', 1)
  });
  it('deve adicionar um produto ao carrinho', () => {
    cy.get('.btn-add').first().click();
    cy.get('.cart-item').should('have.length.at.least', 1)
  })
});