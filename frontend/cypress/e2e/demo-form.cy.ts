describe('Demo module - form', () => {
  it('should display the reactive form', () => {
    cy.visit('/#/demo/lab/forms');
    cy.get('[data-qa="demo-form"]').should('exist');
  });
});
