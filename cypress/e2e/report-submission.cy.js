function typeByLabel(labelText, value) {
  cy.contains('label', labelText)
    .invoke('attr', 'for')
    .then((inputId) => {
      cy.get(`#${inputId}`).clear().type(value);
    });
}

describe('Report submission', () => {
  it('shows a minimum-info message when coordinates are invalid', () => {
    cy.visit('/submit-report');

    typeByLabel('Report Title', 'Possible encounter');
    typeByLabel('Report Summary', 'Brief summary of the event');
    typeByLabel('Date', '2025-01-15');
    typeByLabel('Latitude', 'not-a-number');
    typeByLabel('Longitude', '-120.25');

    cy.contains('button', /^Submit Report$/).click();

    cy.contains('Please add title, summary, date, and map coordinates to continue.').should('be.visible');
    cy.contains('Triage status:').should('be.visible');
    cy.contains('Needs Minimum Info').should('be.visible');
  });

  it('submits a valid report and resets required fields', () => {
    cy.intercept('POST', '**/api/reports', (request) => {
      expect(request.body.title).to.equal('Valid report');
      expect(request.body.summary).to.equal('Validated summary text');
      expect(request.body.position).to.deep.equal({ lat: 46.2, lng: -121.4 });
      request.reply({
        statusCode: 201,
        body: { id: 'submission_1' },
      });
    }).as('submitReport');

    cy.visit('/submit-report');

    typeByLabel('Report Title', 'Valid report');
    typeByLabel('Report Summary', 'Validated summary text');
    typeByLabel('Date', '2025-02-01');
    typeByLabel('Latitude', '46.2');
    typeByLabel('Longitude', '-121.4');

    cy.contains('button', /^Submit Report$/).click();
    cy.wait('@submitReport');

    cy.contains('Submission received. Your report has entered the triage queue.').should('be.visible');

    cy.contains('label', 'Report Title')
      .invoke('attr', 'for')
      .then((inputId) => {
        cy.get(`#${inputId}`).should('have.value', '');
      });
  });
});
