describe('Diagram Reduction E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('uploads JSON and shows Reduced and Original Diagrams on success', () => {
    const absoluteUrl = 'http://localhost:8080/api/diagramprocess/reduce';

    cy.fixture('reduced-diagram.json').then((reduced) => {
      cy.intercept('POST', absoluteUrl, {
        statusCode: 200,
        body: reduced,
        headers: { 'content-type': 'application/json', 'access-control-allow-origin': 'http://localhost:4200' }
      }).as('reduce');
    });

    cy.get('input[type=file]').selectFile('cypress/fixtures/original-diagram.json', { force: true });

    cy.wait('@reduce', { timeout: 15000 }).then((interception) => {
      expect(interception?.response?.statusCode).to.eq(200);
      const body = interception?.response?.body as any;
      expect(body).to.have.property('nodes');
      expect(body).to.have.property('edges');
      expect(body.nodes).to.have.length(4);
      expect(body.edges).to.have.length(3);
    });

    cy.contains('Reduced Diagram (Human Tasks Only)').should('exist');
    cy.contains('Original Diagram').should('exist');

    cy.get('app-diagram-display').first().find('pre').invoke('text').then((text) => {
      const reduced = JSON.parse(text as unknown as string);
      const names = reduced.nodes.map((n: any) => n.name);
      expect(reduced.nodes).to.have.length(4);
      expect(names).to.include.members(['Start', 'Human Task A', 'Human Task B', 'End']);
      expect(reduced.edges).to.have.length(3);
    });
  });

  it('shows error when backend returns error', () => {
    const absoluteUrl = 'http://localhost:8080/api/diagramprocess/reduce';

    cy.intercept('POST', absoluteUrl, {
      statusCode: 500,
      body: { message: 'Internal error' },
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': 'http://localhost:4200' }
    }).as('reduceError');

    cy.get('input[type=file]').selectFile('cypress/fixtures/original-diagram.json', { force: true });

    cy.wait('@reduceError', { timeout: 15000 }).then((interception) => {
      expect(interception?.response?.statusCode).to.eq(500);
      expect(interception?.response?.body).to.have.property('message', 'Internal error');
    });

    cy.get('app-error-display').should('contain.text', ' Internal error ');
    cy.contains('Reduced Diagram (Human Tasks Only)').should('not.exist');
    cy.contains('Original Diagram').should('not.exist');
  });

  it('handles errorDiagram.json with backend error message', () => {
    const absoluteUrl = 'http://localhost:8080/api/diagramprocess/reduce';

    cy.intercept('POST', absoluteUrl, {
      statusCode: 400,
      body: { message: 'Invalid diagram' },
      headers: { 'content-type': 'application/json' }
    }).as('reduceInvalid');

    cy.get('input[type=file]').selectFile('cypress/fixtures/errorDiagram.json', { force: true });

    cy.wait('@reduceInvalid', { timeout: 15000 }).then((interception) => {
      expect(interception?.response?.statusCode).to.eq(400);
      expect(interception?.response?.body).to.have.property('message', 'Invalid diagram');
    });

    cy.get('app-error-display').should('contain.text', ' Invalid diagram ');
    cy.contains('Reduced Diagram (Human Tasks Only)').should('not.exist');
    cy.contains('Original Diagram').should('not.exist');
  });

  it('handles errorDiagram2.json with backend error message', () => {
    const absoluteUrl = 'http://localhost:8080/api/diagramprocess/reduce';

    cy.intercept('POST', absoluteUrl, {
      statusCode: 422,
      body: { message: 'Unprocessable diagram' },
      headers: { 'content-type': 'application/json' }
    }).as('reduceUnprocessable');

    cy.get('input[type=file]').selectFile('cypress/fixtures/errorDiagram2.json', { force: true });

    cy.wait('@reduceUnprocessable', { timeout: 15000 }).then((interception) => {
      expect(interception?.response?.statusCode).to.eq(422);
      expect(interception?.response?.body).to.have.property('message', 'Unprocessable diagram');
    });

    cy.get('app-error-display').should('contain.text', ' Unprocessable diagram ');
    cy.contains('Reduced Diagram (Human Tasks Only)').should('not.exist');
    cy.contains('Original Diagram').should('not.exist');
  });

  it('reduces 1-simple-process.json with only human/start/end nodes present', () => {
    const absoluteUrl = 'http://localhost:8080/api/diagramprocess/reduce';

    cy.intercept('POST', absoluteUrl, (req) => {
      const body = req.body;
      const humanNodes = body.nodes.filter((n: any) => ['Start', 'End', 'HumanTask'].includes(n.type));
      const reduced = { nodes: humanNodes, edges: body.edges };
      req.reply({ statusCode: 200, body: reduced, headers: { 'content-type': 'application/json' } });
    }).as('reduceSimple');

    cy.get('input[type=file]').selectFile('cypress/fixtures/1-simple-process.json', { force: true });
    cy.wait('@reduceSimple').then((interception) => {
      expect(interception?.response?.statusCode).to.eq(200);
      const body = interception?.response?.body as any;
      expect(body.nodes.length).to.eq(4);
      // edges are echoed; ensure path count
      expect(body.edges.length).to.eq(5);
    });

    cy.get('app-diagram-display').first().find('pre').invoke('text').then((text) => {
      const reduced = JSON.parse(text as unknown as string);
      const names = reduced.nodes.map((n: any) => n.name);
      expect(names).to.include.members(['Start', 'B', 'D', 'End']);
      expect(names).to.not.include.members(['A', 'C']);
      expect(reduced.nodes).to.have.length(4);
    });
  });

  it('reduces 2-multiple-human-services.json with humans retained and service filtered', () => {
    const absoluteUrl = 'http://localhost:8080/api/diagramprocess/reduce';

    cy.intercept('POST', absoluteUrl, (req) => {
      const body = req.body;
      const humanNodes = body.nodes.filter((n: any) => ['Start', 'End', 'HumanTask'].includes(n.type));
      const reduced = { nodes: humanNodes, edges: body.edges };
      req.reply({ statusCode: 200, body: reduced, headers: { 'content-type': 'application/json' } });
    }).as('reduceMulti');

    cy.get('input[type=file]').selectFile('cypress/fixtures/2-multiple-human-services.json', { force: true });
    cy.wait('@reduceMulti').then((interception) => {
      expect(interception?.response?.statusCode).to.eq(200);
      const body = interception?.response?.body as any;
      expect(body.nodes.length).to.eq(5);
      expect(body.edges.length).to.eq(5);
    });

    cy.get('app-diagram-display').first().find('pre').invoke('text').then((text) => {
      const reduced = JSON.parse(text as unknown as string);
      const names = reduced.nodes.map((n: any) => n.name);
      expect(names).to.include.members(['Start', 'A', 'B', 'D', 'End']);
      expect(names).to.not.include('C');
      expect(reduced.nodes).to.have.length(5);
    });
  });

  it('reduces 3-branching-process.json and 4-recursive-branching-process.json correctly', () => {
    const absoluteUrl = 'http://localhost:8080/api/diagramprocess/reduce';

    cy.intercept('POST', absoluteUrl, (req) => {
      const body = req.body;
      const humanNodes = body.nodes.filter((n: any) => ['Start', 'End', 'HumanTask'].includes(n.type));
      const reduced = { nodes: humanNodes, edges: body.edges };
      req.reply({ statusCode: 200, body: reduced, headers: { 'content-type': 'application/json' } });
    }).as('reduceBranch');

    cy.get('input[type=file]').selectFile('cypress/fixtures/3-branching-process.json', { force: true });
    cy.wait('@reduceBranch').then((interception) => {
      expect(interception?.response?.statusCode).to.eq(200);
      const body = interception?.response?.body as any;
      // Includes Start,B,C,D,End (5 nodes)
      expect(body.nodes.length).to.be.greaterThan(4);
    });
    cy.get('app-diagram-display').first().find('pre').invoke('text').then((text) => {
      const reduced = JSON.parse(text as unknown as string);
      const names = reduced.nodes.map((n: any) => n.name);
      expect(names).to.include.members(['Start', 'B', 'C', 'D', 'End']);
      expect(names).to.not.include('#');
    });

    cy.get('input[type=file]').selectFile('cypress/fixtures/4-recursive-branching-process.json', { force: true });
    cy.wait('@reduceBranch').then((interception) => {
      expect(interception?.response?.statusCode).to.eq(200);
      const body = interception?.response?.body as any;
      expect(body.nodes.length).to.be.greaterThan(4);
    });
    cy.get('app-diagram-display').first().find('pre').invoke('text').then((text) => {
      const reduced = JSON.parse(text as unknown as string);
      const names = reduced.nodes.map((n: any) => n.name);
      expect(names).to.include.members(['Start', 'B', 'C', 'D', 'End']);
      expect(names).to.not.include('#');
    });
  });

  it('handles empty-nodes.json by showing empty diagram message', () => {
    const absoluteUrl = 'http://localhost:8080/api/diagramprocess/reduce';

    cy.intercept('POST', absoluteUrl, {
      statusCode: 200,
      body: { nodes: [], edges: [] },
      headers: { 'content-type': 'application/json' }
    }).as('reduceEmpty');

    cy.get('input[type=file]').selectFile('cypress/fixtures/empty-nodes.json', { force: true });
    cy.wait('@reduceEmpty').then((interception) => {
      expect(interception?.response?.statusCode).to.eq(200);
      const body = interception?.response?.body as any;
      expect(body.nodes.length).to.eq(0);
      expect(body.edges.length).to.eq(0);
    });

    cy.contains('Reduced Diagram (Human Tasks Only)').should('exist');
    cy.get('app-diagram-display').first().within(() => {
      cy.contains('No diagram data to display').should('exist');
    });
  });

  it('handles empty-edges.json ensuring nodes exist and edges are zero', () => {
    const absoluteUrl = 'http://localhost:8080/api/diagramprocess/reduce';

    cy.intercept('POST', absoluteUrl, (req) => {
      const body = req.body;
      const humanNodes = body.nodes.filter((n: any) => ['Start', 'End', 'HumanTask'].includes(n.type));
      const reduced = { nodes: humanNodes, edges: [] };
      req.reply({ statusCode: 200, body: reduced, headers: { 'content-type': 'application/json' } });
    }).as('reduceEmptyEdges');

    cy.get('input[type=file]').selectFile('cypress/fixtures/empty-edges.json', { force: true });
    cy.wait('@reduceEmptyEdges').then((interception) => {
      expect(interception?.response?.statusCode).to.eq(200);
      const body = interception?.response?.body as any;
      expect(body.nodes.length).to.eq(3);
      expect(body.edges.length).to.eq(0);
    });

    cy.get('app-diagram-display').first().find('pre').invoke('text').then((text) => {
      const reduced = JSON.parse(text as unknown as string);
      expect(reduced.nodes.map((n: any) => n.name)).to.include.members(['Start', 'Task A', 'End']);
      expect(reduced.edges).to.have.length(0);
    });
  });

  it('processes large-structure.json and renders reduced output quickly', () => {
    const absoluteUrl = 'http://localhost:8080/api/diagramprocess/reduce';

    cy.intercept('POST', absoluteUrl, (req) => {
      const body = req.body;
      const humanNodes = body.nodes.filter((n: any) => ['Start', 'End', 'HumanTask'].includes(n.type));
      const reduced = { nodes: humanNodes, edges: body.edges.filter((e: any) => e.from % 5 === 0 || e.to % 5 === 0) };
      req.reply({ statusCode: 200, body: reduced, headers: { 'content-type': 'application/json' } });
    }).as('reduceLarge');

    const start = Date.now();
    cy.get('input[type=file]').selectFile('cypress/fixtures/large-structure.json', { force: true });
    cy.wait('@reduceLarge').then((interception) => {
      expect(interception?.response?.statusCode).to.eq(200);
      const body = interception?.response?.body as any;
      // Expect many nodes due to large input; at least Start, End and ~20 human tasks
      expect(body.nodes.length).to.be.greaterThan(20);
      expect(body.edges.length).to.be.greaterThan(0);
    });

    cy.get('app-diagram-display').first().find('pre').invoke('text').then((text) => {
      const reduced = JSON.parse(text as unknown as string);
      const names = reduced.nodes.map((n: any) => n.name);
      expect(names).to.include('Start');
      expect(names).to.include('End');
      expect(names.filter((n: any) => String(n).startsWith('H'))).to.have.length.greaterThan(10);
      expect(Date.now() - start).to.be.lessThan(2000);
    });
  });
});
