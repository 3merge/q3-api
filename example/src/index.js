import './models';
import Q3 from 'q3-api';
import plugin from 'q3-api-plugin-users';

Q3.init();
Q3.register(plugin);
Q3.walk('/src/api');

Q3.connect().then((err) => {
  if (err) process.exit(1);
  // eslint-disable-next-line
  console.log('Started');
});
