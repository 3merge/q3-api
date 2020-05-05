const Q3 = require('q3-api');
const userFixture = require('./data/user');

const { Users } = Q3;

exports.genUser = () => Users.create(userFixture);
