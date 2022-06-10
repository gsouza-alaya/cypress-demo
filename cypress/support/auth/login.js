/**
 * Command: login
 * Arguments:
 *   > role (String)
 *   Specifies the role to be logged in as. The value entered must have a corresponding
 *   key in cypress.env.json.
 *
 *   > silent (Boolean)
 *   True: does an assertion on getting auth cookies and print the result to the console.
 *   False: skips the assertion and blindly try to login.
 */
Cypress.Commands.add('login', ({ role = 'admin', silent = false, refresh = false } = {}) => {
  const tenant = Cypress.env('tenant');
  const { email, password } = Cypress.env('credentials')[tenant][role];
  const baseUrl = Cypress.config('baseUrl').split('#')[0];
  cy.clearCookie('PHPSESSID');
  cy.clearCookie('_lang');

  Cypress.log({
    name: `Login as role: ${role}`,
    message: `${email}`,
  });

  const lang = Cypress.env('lang');
  /**
   * Refreshes a PHPSESSID authentication token.
   *
   */
  const refreshToken = () => {
    cy.log('Refreshing auth token...');

    cy.request({
      method: 'POST',
      url: `/api/v1/users/login?locale=${lang}`,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: `Basic ${btoa(`${email}:${password}`)}`,
      },
      failOnStatusCode: silent,
    }).then((response) => {
      if (response.status !== 200) {
        cy.log('An error happened while logging in', JSON.stringify(response.body));
      }
      expect(response.status).to.eq(200);
      // Save the cookie in Cypress env variables to reuse it afterward.
      const { defaultTimeout } = Cypress.env('adminAuthToken');
      const expiresAt = new Date().getTime() + defaultTimeout * 60 * 1000;
      cy.getCookie('PHPSESSID').then((cookie) => {
        Cypress.env('adminAuthToken', {
          token: cookie.value,
          expiresAt,
          defaultTimeout,
        });
      });
    });
  };

  /**
   * Sets the admin token retrieved from presteps as a valid one.
   *
   */
  const setTokenAsCookie = () => {
    cy.log('Reusing auth cookie from pre-step...');
    const domain = Cypress.config('baseUrl').replace('https://', '').replace('/', '');

    cy.setCookie('PHPSESSID', Cypress.env('adminAuthToken').token, {
      domain,
      httpOnly: true,
      secure: true,
    });
    cy.setCookie('_lang', lang, {
      domain,
      httpOnly: true,
      secure: true,
    });
  };

  /**
   * Asserts the existence of a PHPSESSID cookie.
   *
   */
  const assertAuthToken = () => {
    if (!silent) {
      cy.getCookie('PHPSESSID').should('exist');
    }
  };

  // If role is not set to admin, early eject.
  if (role !== 'admin' || refresh === true) {
    refreshToken();
    assertAuthToken();
    return;
  }

  const hasExpired =
    Cypress.env('adminAuthToken').expiresAt < new Date().getTime() ||
    !Cypress.env('adminAuthToken')?.token;
  if (hasExpired === true) {
    refreshToken();
    assertAuthToken();
  } else {
    setTokenAsCookie();
    assertAuthToken();
  }
});
