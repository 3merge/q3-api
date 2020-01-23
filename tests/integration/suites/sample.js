const mongoose = require('mongoose');
const { get } = require('q3-core-session');

const key = 'TEST';
const Schema = new mongoose.Schema({
  name: String,
});

const querySession = () =>
  new Promise((r) =>
    setTimeout(() => {
      // eslint-disable-next-line
      console.log(get(key));
      r();
    }, 500),
  );

// eslint-disable-next-line
Schema.pre('find', async function() {
  await querySession();
});

// eslint-disable-next-line
Schema.post('find', async function() {
  // eslint-disable-next-line
  console.log(this.__$q3);
  await querySession();
});

Schema.key = key;
module.exports = Schema;
