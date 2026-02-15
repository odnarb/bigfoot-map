const MAP_TEST_REPORTS = [
  {
    id: 'bfro_map_1',
    datasetKey: 'bfro',
    title: 'Map Render Probe A',
    summary: 'Marker used to verify map rendering.',
    isoDate: '2024-05-01T00:00:00.000Z',
    timestampMs: Date.UTC(2024, 4, 1),
    countryCode: 'US',
    stateCode: 'WA',
    countyName: 'King',
    position: { lat: 47.6062, lng: -122.3321 },
    triage: { status: 'new', tier: 'unreviewed', minimumInfoComplete: true, followedUpBy: null, statusHistory: [] },
    votes: { up: 0, down: 0, byUser: {} },
  },
  {
    id: 'woodape_map_1',
    datasetKey: 'woodape',
    title: 'Map Render Probe B',
    summary: 'Second marker to verify clustered map rendering.',
    isoDate: '2023-09-10T00:00:00.000Z',
    timestampMs: Date.UTC(2023, 8, 10),
    countryCode: 'US',
    stateCode: 'FL',
    countyName: 'Miami-Dade',
    position: { lat: 25.7617, lng: -80.1918 },
    triage: { status: 'new', tier: 'screened', minimumInfoComplete: true, followedUpBy: null, statusHistory: [] },
    votes: { up: 1, down: 0, byUser: {} },
  },
];

function visitMapWithStubbedData() {
  cy.intercept('GET', '**/api/reports*', {
    statusCode: 200,
    body: {
      reports: MAP_TEST_REPORTS,
      count: MAP_TEST_REPORTS.length,
    },
  }).as('getReports');

  cy.visit('/');
  cy.wait('@getReports');
}

function mapControlSwitch(labelText) {
  return cy.contains('.MuiFormControlLabel-root', labelText).find('input[type="checkbox"]');
}

function assertNoGoogleMapsAuthOverlay() {
  cy.get('body').then(($body) => {
    const pageText = $body.text();
    const hasAuthError =
      pageText.includes("This page can't load Google Maps correctly")
      || pageText.includes('For development purposes only');

    if (hasAuthError) {
      throw new Error(
        'Google Maps is mounted but authentication/billing is failing. Check VITE_GOOGLE_MAPS_API_KEY, map ID, allowed referrers, and billing.',
      );
    }
  });
}

describe('Map rendering diagnostics', () => {
  it('loads the Google Maps runtime and renders map surface content', () => {
    cy.viewport(1000, 660);
    visitMapWithStubbedData();

    cy.window().its('google.maps').should('exist');
    cy.get('.map-canvas-wrap').should('be.visible');
    cy.get('.map-canvas-wrap').should('have.css', 'border-top-width', '0px');
    cy.get('#map-container').should('be.visible');
    cy.get('#map-container').should(($container) => {
      expect($container.height()).to.be.greaterThan(420);
      expect($container.width()).to.be.greaterThan(700);
    });

    cy.get('#map-container .gm-style', { timeout: 10000 }).should('exist');
    cy.get('#map-container canvas, #map-container img').its('length').should('be.greaterThan', 0);
    assertNoGoogleMapsAuthOverlay();
  });

  it('renders interactive markers on the map and keeps map mounted while filtering', () => {
    cy.viewport(1000, 660);
    visitMapWithStubbedData();

    mapControlSwitch('BFRO').should('be.checked');
    mapControlSwitch('Woodape').should('not.be.checked');
    mapControlSwitch('Kilmury').should('not.be.checked');

    cy.get('.bf-marker-icon', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.get('#map-container .gm-style').should('exist');
    cy.get('.bf-marker-icon').first().click({ force: true });
    cy.get('.bf-marker-icon.selected', { timeout: 10000 }).should('exist');

    cy.contains('.MuiFormControlLabel-root', 'BFRO').click();
    cy.get('.bf-marker-icon', { timeout: 10000 }).should('have.length', 0);
    cy.get('#map-container .gm-style').should('exist');

    cy.contains('.MuiFormControlLabel-root', 'Woodape').click();
    cy.get('.bf-marker-icon', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.get('#map-container .gm-style').should('exist');
  });
});
