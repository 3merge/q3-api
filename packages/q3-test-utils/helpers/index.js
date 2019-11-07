const supertest = require('supertest');
const mongoose = require('mongoose');

const getSuperAgent = async (Q3) => {
  const passport = await Q3.User.create({
    verified: true,
    firstName: 'Clark',
    lastName: 'Kent',
    email: 'clark.kent@marvel.com',
    role: 'Super',
    lang: 'en-CA',
    secret: 'Shh!',
  });

  await passport.setPassword();
  await Q3.connect();

  const Authorization = `Apikey ${await passport.generateApiKey()}`;
  const agent = supertest(Q3.$app);
  return { agent, Authorization };
};

const destroySuperAgent = async (Q3) => {
  await Q3.User.findOneAndDelete({
    email: 'clark.kent@marvel.com',
  });
};

const willThrowException = async (fn, name) => {
  try {
    await fn;
    throw new Error('Initial function passed unexpectedly');
  } catch (e) {
    expect(e.name).toMatch(name);
  }
};

const initMongoose = () => {
  mongoose.pluralize(null);
  mongoose.set('useEnsureIndex', true);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useUnifiedTopology', true);
};

module.exports = {
  getSuperAgent,
  destroySuperAgent,
  willThrowException,
  initMongoose,
};
