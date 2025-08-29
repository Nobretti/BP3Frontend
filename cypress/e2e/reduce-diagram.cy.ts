describe('Diagram Reduction E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('uploads JSON and shows Reduced Diagram on success', () => {
    cy.fixture('reduced-diagram.json').then((reduced) => {
      cy.intercept('POST', 'http://localhost:8080/api/diagramprocess/reduce', {
        statusCode: 200,
        body: reduced,
        headers: { 'content-type': 'application/json' }
      }).as('reduce');
    });

    cy.fixture('original-diagram.json').then((fileContent) => {
      const blob = new Blob([JSON.stringify(fileContent)], { type: 'application/json' });
      const testFile = new File([blob], 'sample-diagram.json', { type: 'application/json' });

      cy.contains('button', 'Choose JSON File').click();

      cy.get('input[type=file]').selectFile({ contents: testFile, fileName: 'sample-diagram.json', mimeType: 'application/json' }, { force: true });
    });

    cy.wait('@reduce');

    cy.contains('Reduced Diagram (Human Tasks Only)').should('exist');
    cy.get('app-diagram-display').first().within(() => {
      cy.get('pre').should('contain.text', 'Human Task A');
      cy.get('pre').should('contain.text', 'Human Task B');
    });
  });

  it('shows error when backend returns error', () => {
    cy.intercept('POST', 'http://localhost:8080/api/diagramprocess/reduce', {
      statusCode: 500,
      body: { message: 'Internal error' },
      headers: { 'content-type': 'application/json' }
    }).as('reduceError');

    cy.fixture('original-diagram.json').then((fileContent) => {
      const blob = new Blob([JSON.stringify(fileContent)], { type: 'application/json' });
      const testFile = new File([blob], 'sample-diagram.json', { type: 'application/json' });

      cy.contains('button', 'Choose JSON File').click();
      cy.get('input[type=file]').selectFile({ contents: testFile, fileName: 'sample-diagram.json', mimeType: 'application/json' }, { force: true });
    });

    cy.wait('@reduceError');

    cy.get('app-error-display').should('contain.text', 'Backend error while reducing diagram');
  });
});
