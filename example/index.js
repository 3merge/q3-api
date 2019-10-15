require('./models');
const Q3 = require('q3-api');
const walker = require('q3-core-walker');

const clearDB = async () => {
  // await Q3.User.deleteMany({});
  // await Q3.model('q3-api-permissions').deleteMany({});
};

const seedDB = async () => {
  // await Q3.User.create(users);
  // await Q3.model('q3-api-permissions').create(permissions);
};

Q3.routes(walker('example/routes'));

Q3.connect()
  .then(clearDB)
  .then(seedDB);
