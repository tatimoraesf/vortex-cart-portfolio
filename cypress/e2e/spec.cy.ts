describe('Vortex Cart', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('deve exibir a lista de produtos', () => {
    cy.get('.product-card').should('have.length.at.least', 1)
  })
})