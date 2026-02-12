describe('Navigation and layout behavior', () => {
  it('navigates between core pages using the drawer menu', () => {
    cy.visit('/');

    cy.get('button[aria-label="open drawer"]').click();
    cy.get('a[href="/submit-report"]').click();
    cy.url().should('include', '/submit-report');
    cy.contains('Submit an Encounter Report').should('be.visible');

    cy.get('button[aria-label="open drawer"]').click();
    cy.get('a[href="/about"]').click();
    cy.url().should('include', '/about');
    cy.contains('About Mapping Sasquatch').should('be.visible');

    cy.get('button[aria-label="open drawer"]').click();
    cy.get('a[href="/donate"]').click();
    cy.url().should('include', '/donate');
    cy.contains('Support Mapping Sasquatch').should('be.visible');
  });

  it('toggles split view report panel from map controls', () => {
    cy.visit('/');
    cy.get('.report-list-panel').should('not.exist');

    cy.contains('List + Map Split View').click();
    cy.get('.report-list-panel').should('exist');

    cy.contains('List + Map Split View').click();
    cy.get('.report-list-panel').should('not.exist');
  });
});
