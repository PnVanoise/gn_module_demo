describe('Demo module - routing', () => {
  it('should navigate to the rxjs lab', () => {
    cy.visit('/#/demo/lab/rxjs');
    cy.contains('Recherche Taxref').should('exist');
  });
});
