const Q3 = require('q3-api');
const files = require('q3-api-plugin-files');

Q3.register(files);

console.log(files.middleware);

Q3.connect().then(() => {
  // noop
});
