function mapControlSwitch(labelText) {
  return cy.contains('.MuiFormControlLabel-root', labelText).find('input[type="checkbox"]');
}

describe('Map filter UI options', () => {
  it('toggles dataset and feature switches from the controls panel', () => {
    cy.visit('/');

    cy.contains('Research Controls').should('be.visible');

    mapControlSwitch('BFRO').should('be.checked');
    mapControlSwitch('Woodape').should('not.be.checked');
    mapControlSwitch('Kilmury').should('not.be.checked');
    mapControlSwitch('Heatmap').should('not.be.checked');
    mapControlSwitch('County Overlay').should('not.be.checked');
    mapControlSwitch('List + Map Split View').should('not.be.checked');

    cy.contains('.MuiFormControlLabel-root', 'BFRO').click();
    mapControlSwitch('BFRO').should('not.be.checked');
    cy.contains('.MuiFormControlLabel-root', 'BFRO').click();
    mapControlSwitch('BFRO').should('be.checked');

    cy.contains('.MuiFormControlLabel-root', 'County Overlay').click();
    mapControlSwitch('County Overlay').should('be.checked');
    cy.contains('.MuiFormControlLabel-root', 'County Overlay').click();
    mapControlSwitch('County Overlay').should('not.be.checked');

    cy.get('.report-list-panel').should('not.exist');
    cy.contains('.MuiFormControlLabel-root', 'List + Map Split View').click();
    mapControlSwitch('List + Map Split View').should('be.checked');
    cy.get('.report-list-panel').should('exist');
    cy.contains('.MuiFormControlLabel-root', 'List + Map Split View').click();
    mapControlSwitch('List + Map Split View').should('not.be.checked');
    cy.get('.report-list-panel').should('not.exist');
  });

  it('updates timeline filter label when scrubbed', () => {
    cy.visit('/');

    cy.get('[aria-label^="Timeline Scrub"]').first().as('timelineInput');
    cy.get('@timelineInput')
      .invoke('attr', 'aria-label')
      .then((timelineLabel) => {
        const yearMatch = timelineLabel.match(/\((\d{4})\)/);
        expect(yearMatch, 'timeline label includes a year').to.not.be.null;

        const initialYear = Number(yearMatch[1]);

        cy.get('@timelineInput').focus().type('{leftarrow}{leftarrow}');

        cy.get('[aria-label^="Timeline Scrub"]')
          .first()
          .invoke('attr', 'aria-label')
          .should('include', `(${initialYear - 2})`);
      });

    cy.get('[aria-label="Date Range"]').should('exist');
  });
});
