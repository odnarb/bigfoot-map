describe('Map polish and performance smoke', () => {
  it('loads map controls and supports split view interactions', () => {
    cy.visit('/');
    cy.contains('Research Controls').should('be.visible');
    cy.contains('List + Map Split View').should('be.visible');
    cy.contains('Reports').should('be.visible');
  });

  it('timeline scrub responds without long stalls', () => {
    cy.visit('/');
    cy.window().then((windowObject) => {
      windowObject.__timelineStart = performance.now();
    });

    cy.get('[aria-label^="Timeline Scrub"]').should('exist').then(($slider) => {
      const sliderElement = $slider[0];
      sliderElement.focus();
      cy.wrap(sliderElement).type('{rightarrow}{rightarrow}{rightarrow}');
    });

    cy.window().then((windowObject) => {
      const elapsed = performance.now() - windowObject.__timelineStart;
      expect(elapsed).to.be.lessThan(3000);
    });
  });
});
