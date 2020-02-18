/* eslint-disable import/no-extraneous-dependencies */
const supertest = require('supertest');
const Q3 = require('q3-api');

module.exports = async () => {
  const agent = supertest(Q3.$app);
  await Q3.connect();
  return agent;
};
