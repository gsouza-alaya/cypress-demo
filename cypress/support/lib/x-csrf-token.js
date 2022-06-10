/**
 * Sets X-CSRF-Token to outgoing requests.
 * Even though, this should be set within the global cy.server() in support/index.js, some network
 * calls made from within the test runner don't have this header attached causing 403s...
 */
Cypress.Commands.add('setCSRFToken', () => {
  cy.server({
    onAnyRequest(route, proxy) {
      proxy.xhr.setRequestHeader('X-CSRF-Token', 'true');
    },
  });
});
