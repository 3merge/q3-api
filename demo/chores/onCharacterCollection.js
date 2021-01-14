const session = require('q3-core-session');

module.exports = async () => {
  try {
    console.log('hello???');
    console.log(session.get('USER'), 'IN JOB');
  } catch (e) {
    console.log(e);
  }
};
