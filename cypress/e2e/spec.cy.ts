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

  it('deve exibir a lista de produtos', () => {
    cy.get('.product-card').should('have.length.at.least', 1)
  });

  it('deve adicionar um produto ao carrinho', () => {
    cy.get('.btn-add').first().click();
    cy.get('.cart-item').should('have.length.at.least', 1)
  });

  it('deve remover um produto do carrinho', () => {
    cy.get('.btn-add').first().click();
    cy.get('.cart-item').should('have.length.at.least', 1);
    cy.get('.btn-remove').first().click();
    cy.get('.cart-item').should('have.length', 0)
  });

  it('deve desabilitar o botão quando o produto está esgotado', () => {
    Cypress._.times(5, () => {
      cy.get(".btn-add").eq(1).click();
    });
    cy.get('.btn-add').eq(1).should('be.disabled');
  });
});