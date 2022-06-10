const getBaseUrl = () => {
  const full = Cypress.config('baseUrl');
  return {
    full,
    api: full.split('/#')[0],
  };
};

export { getBaseUrl };
