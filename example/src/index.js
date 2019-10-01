import './models';
import Q3 from 'q3-api';
import plugin, { seedSuperUser } from 'q3-api-plugin-users';

Q3.init();
Q3.register(plugin);
Q3.walk('/src/api');

Q3.connect()
  .then((err) => {
    if (err) process.exit(1);
    return seedSuperUser({
      firstName: 'Jon',
      lastName: 'Doe',
      email: 'jon@doe.net',
    });
  })
  .then((doc) => {
    // eslint-disable-next-line
    console.log(doc)
  });
