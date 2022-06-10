import '@testing-library/cypress/add-commands';
import { createVacantVisit } from '../../fixtures/visits/fixture-vacant-visit';

describe('Create offer from visit', () => {
  context('Outbox', () => {
    let visitCreated;
    let offerCreated;
    it('Login and open marketplace tab', () => {
      cy.login();
      cy.visit('/#/dashboard/marketplace/');
      cy.findByRole('button', { name: '+ Add Visit Offer' }).should('exist');
    });

    it('Create a vacant visit', async () => {
      visitCreated = await createVacantVisit();
    });

    it('Open visit picker for offer creation', () => {
      cy.intercept({
        url: '/api/v1/scheduler/**',
      }).as('getVisits');

      cy.findByRole('button', { name: '+ Add Visit Offer' }).click();
      cy.wait('@getVisits').its('response.statusCode').should('equal', 200);
    });

    it('Select created visit', () => {
      cy.get('.modal-source-picker [data-test=acdatagrid__pagination__per-page__button]').then(
        (perPage) => {
          cy.wrap(perPage).click();
          cy.wrap(perPage).get('#acds-100').click();
        }
      );

      cy.get(
        `[data-test-id=acdatagrid__table__row-${visitCreated.id}] input[name=visit-picker]`
      ).click();
    });

    it('Show selected visit offer preview ', () => {
      cy.intercept({
        url: `/api/v1/alayamarket/outbox/offers/preview/from_visit/${visitCreated.id}`,
      }).as('getOfferDetails');
      cy.findByRole('button', { name: 'Select' }).click();
      cy.wait('@getOfferDetails').its('response.statusCode').should('equal', 200);
    });

    it('Send offer', () => {
      cy.intercept({
        method: 'POST',
        url: `/api/v1/alayamarket/outbox/offers/from_visit/${visitCreated.id}`,
      }).as('sendOffer');

      cy.intercept({
        url: `/api/v1/alayamarket/outbox/offers?**`,
      }).as('getOffers');

      cy.findByRole('button', { name: 'Type of Care' }).click();
      cy.get('[data-test-id=acds-psw]').click();

      cy.findByRole('button', { name: 'Send Offer' }).click();

      cy.wait('@sendOffer').should((response) => {
        offerCreated = response.response.body.offer;
        expect(response.response.statusCode).to.eq(201);
      });
      cy.wait('@getOffers').its('response.statusCode').should('equal', 200);
      cy.contains('Offer has been successfully sent!').should('be.visible');
    });

    it('Verify offer created in outbox datagrid', () => {
      cy.get(`[data-test-id=acdatagrid__table__row-${offerCreated.id}]`);
    });
  });
});
