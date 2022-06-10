// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import './auth/login';
import './lib/x-csrf-token';
import { getBaseUrl } from './lib/getBaseUrl';
import dayjs from 'dayjs';
import { useMiddlewares, httpClientSync, TEAMS } from '@alayacare/qa-automation-lib';

/**
 * Inject global useMiddlewares
 *
 * @param {array} middlewares - Array of middleware callbacks
 */
global.useMiddlewares = (middlewares) => {
  const initHttp = httpClientSync({
    preset: ['cypress-acc'],
  });
  const options = {
    client: cy,
    lib: Cypress,
    httpClient: initHttp,
    apiUrl: getBaseUrl().api,
  };
  return useMiddlewares(middlewares, options).catch((e) => {
    throw e;
  });
};

/**
 * Cookies handling.
 *
 */
Cypress.Cookies.defaults({
  preserve: ['PHPSESSID', '_lang'],
});

Cypress.dayjs = dayjs;

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

beforeEach(() => {
  cy.setCSRFToken();
});
