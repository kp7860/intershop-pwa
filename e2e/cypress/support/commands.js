// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  cy.server();
  cy.route(/\/categories/).as('categories');
  cy.route('**/i18n/*.json').as('translations');
  cy.wait(3000);

  let newUrl = url;

  if (!Cypress.env('NO_CHANNEL_REDIRECT')) {
    const split = url.split('?');
    newUrl = split[0];
    if (/.*\.b2b\..*/.test(Cypress.spec.name)) {
      newUrl +=
        ';channel=inSPIRED-inTRONICS_Business-Site;features=quoting,compare,recently,businessCustomerRegistration';
    } else if (/.*\.b2c\..*/.test(Cypress.spec.name)) {
      newUrl += ';channel=inSPIRED-inTRONICS-Site';
    }
    if (split.length > 1) {
      newUrl += '?' + split[1];
    }
  }

  originalFn(newUrl, { ...options, failOnStatusCode: false });

  return cy
    .get('body', { timeout: 40000 })
    .should('have.descendants', 'ish-root')
    .then(body => {
      let chain = cy.wait('@translations');
      if (!body.find('#intershop-pwa-state').length) {
        chain = chain.wait('@categories').log('page ready -- top level categories loaded');
      } else {
        chain = chain.log('page ready -- found transferred state');
      }
      return chain.then(() =>
        cy.url().should(newUrl => {
          const simplifiedUrl = url.replace(/[\/\?]/g, '.+').replace(' ', '.+');
          const oldUrlRegex = new RegExp(`(${simplifiedUrl}|\/error$)`);
          expect(newUrl).to.match(oldUrlRegex);
        })
      );
    });
});

// reset cookies for each spec
before(() => {
  cy.clearCookie('apiToken');
  cy.setCookie('cookieLawSeen', 'true');
});

Cypress.Cookies.debug(true);

// keep certain cookies
Cypress.Cookies.defaults({
  whitelist: ['cookieLawSeen', 'apiToken'],
});