/**
 * Command: refreshRole
 * Arguments:
 *   > role (String)
 *   Specifies the role to be logged in as. The value entered must have a corresponding
 *   key in cypress.env.json.
 *
 *
 */
Cypress.Commands.add('refreshRole', ({ role }) => {
  cy.login({ role });
  cy.visit('#/');
});
