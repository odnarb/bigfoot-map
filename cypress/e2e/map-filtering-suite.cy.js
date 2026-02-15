const STUBBED_REPORTS = [
  {
    id: 'bfro_1',
    datasetKey: 'bfro',
    title: 'BFRO Legacy Sighting',
    summary: 'Older BFRO report',
    isoDate: '2012-06-01T00:00:00.000Z',
    timestampMs: Date.UTC(2012, 5, 1),
    countryCode: 'US',
    stateCode: 'WA',
    countyName: 'King',
    position: { lat: 47.6062, lng: -122.3321 },
    triage: { status: 'new', tier: 'unreviewed', minimumInfoComplete: true, followedUpBy: null, statusHistory: [] },
    votes: { up: 1, down: 0, byUser: {} },
  },
  {
    id: 'bfro_2',
    datasetKey: 'bfro',
    title: 'BFRO Modern Sighting',
    summary: 'Recent BFRO report',
    isoDate: '2021-08-10T00:00:00.000Z',
    timestampMs: Date.UTC(2021, 7, 10),
    countryCode: 'US',
    stateCode: 'OR',
    countyName: 'Multnomah',
    position: { lat: 45.5152, lng: -122.6784 },
    triage: { status: 'new', tier: 'unreviewed', minimumInfoComplete: true, followedUpBy: null, statusHistory: [] },
    votes: { up: 2, down: 0, byUser: {} },
  },
  {
    id: 'woodape_1',
    datasetKey: 'woodape',
    title: 'Woodape Case',
    summary: 'Woodape report',
    isoDate: '2018-04-15T00:00:00.000Z',
    timestampMs: Date.UTC(2018, 3, 15),
    countryCode: 'US',
    stateCode: 'CA',
    countyName: 'Shasta',
    position: { lat: 40.5865, lng: -122.3917 },
    triage: { status: 'new', tier: 'screened', minimumInfoComplete: true, followedUpBy: null, statusHistory: [] },
    votes: { up: 0, down: 0, byUser: {} },
  },
  {
    id: 'kilmury_1',
    datasetKey: 'kilmury',
    title: 'Kilmury Entry',
    summary: 'Kilmury report',
    isoDate: '2024-03-20T00:00:00.000Z',
    timestampMs: Date.UTC(2024, 2, 20),
    countryCode: 'US',
    stateCode: 'MT',
    countyName: 'Missoula',
    position: { lat: 46.8721, lng: -113.994 },
    triage: { status: 'in-review', tier: 'high-confidence', minimumInfoComplete: true, followedUpBy: null, statusHistory: [] },
    votes: { up: 4, down: 1, byUser: {} },
  },
];

function mapControlSwitch(labelText) {
  return cy.contains('.MuiFormControlLabel-root', labelText).find('input[type="checkbox"]');
}

function ensureSplitViewEnabled() {
  mapControlSwitch('List + Map Split View').then(($checkbox) => {
    if (!$checkbox.prop('checked')) {
      cy.contains('.MuiFormControlLabel-root', 'List + Map Split View').click();
    }
  });
  mapControlSwitch('List + Map Split View').should('be.checked');
}

function readVisibleCount() {
  return cy.contains('.MuiChip-label', /visible/).invoke('text').then((labelText) => Number.parseInt(labelText, 10));
}

function stubDownloadApis() {
  cy.window().then((windowObject) => {
    cy.stub(windowObject.URL, 'createObjectURL').returns('blob:map-export-test').as('createObjectURL');
    cy.stub(windowObject.URL, 'revokeObjectURL').as('revokeObjectURL');
  });
}

function visitMapWithStubbedReports() {
  cy.intercept('GET', '**/api/reports*', {
    statusCode: 200,
    body: {
      reports: STUBBED_REPORTS,
      count: STUBBED_REPORTS.length,
    },
  }).as('getReports');

  cy.visit('/');
  cy.wait('@getReports');
}

describe('Map filtering suite', () => {
  it('renders the map canvas with controls and seeded list data', () => {
    visitMapWithStubbedReports();
    ensureSplitViewEnabled();

    cy.contains('Research Controls').should('be.visible');
    cy.get('#map-container').should('be.visible');
    cy.get('.map-canvas-wrap').should('be.visible');
    cy.contains('.MuiChip-label', '2 visible').should('be.visible');
    cy.contains('BFRO Legacy Sighting').should('exist');
    cy.contains('Kilmury Entry').should('not.exist');
  });

  it('filters report results by dataset toggles', () => {
    visitMapWithStubbedReports();
    ensureSplitViewEnabled();
    cy.contains('.MuiChip-label', '2 visible').should('be.visible');

    cy.contains('.MuiFormControlLabel-root', 'Woodape').click();
    cy.contains('.MuiChip-label', '3 visible').should('be.visible');

    cy.contains('.MuiFormControlLabel-root', 'Kilmury').click();
    cy.contains('.MuiChip-label', '4 visible').should('be.visible');

    cy.contains('.MuiFormControlLabel-root', 'BFRO').click();
    cy.contains('.MuiChip-label', '2 visible').should('be.visible');
  });

  it('updates visible report count when timeline is scrubbed backward', () => {
    visitMapWithStubbedReports();
    ensureSplitViewEnabled();
    cy.contains('.MuiChip-label', '2 visible').should('be.visible');

    cy.get('[aria-label^="Timeline Scrub"]').first().focus().type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}');

    readVisibleCount().then((visibleCount) => {
      expect(visibleCount).to.be.lessThan(2);
    });
  });

  it('supports county overlay, exports, and filter collapse actions', () => {
    visitMapWithStubbedReports();
    ensureSplitViewEnabled();
    stubDownloadApis();

    mapControlSwitch('List + Map Split View').should('be.checked');
    cy.get('#map-container .gm-style').should('exist');
    cy.contains('.report-list-row', 'BFRO Modern Sighting').click();

    cy.contains('.MuiFormControlLabel-root', 'County Overlay').click();
    mapControlSwitch('County Overlay').should('be.checked');
    cy.get('.county-overlay-chip', { timeout: 10000 }).should('have.length.at.least', 1);

    cy.contains('button', /^CSV$/).click();
    cy.contains('button', /^GeoJSON$/).click();
    cy.get('@createObjectURL').should('have.been.called');

    cy.contains('button', 'Hide Filters').click();
    cy.contains('button', 'Show Filters').should('be.visible');
    cy.get('#map-container .gm-style').should('exist');
    cy.contains('button', 'Show Filters').click();
    cy.contains('button', 'Hide Filters').should('be.visible');
  });
});
