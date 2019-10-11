const Q3 = require('q3-api');
const files = require('q3-api-plugin-files');
const notes = require('q3-api-plugin-notes');

Q3.register(files);
Q3.register(notes);

Q3.connect().then(() => {
  // noop
});
