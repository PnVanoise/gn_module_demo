describe('Demo module - list', () => {
  it('should display demo items', () => {
    cy.visit('/#/demo');
    cy.get('[data-qa="demo-list-item"]').should('exist');
  });
});
