const { model } = require('q3-api');
const mongoose = require('mongoose');

const author = mongoose.Types.ObjectId();

const fixture = {
  topic: mongoose.Types.ObjectId(),
  subscribers: [],
  thread: [
    {
      author,
      date: new Date(),
      message: 'Hey',
    },
    {
      author,
      date: new Date(),
      message: 'There',
    },
  ],
};

fixture.seedUser = async () =>
  model('q3-api-users').create({
    _id: author,
    firstName: 'Foo',
    lastName: 'Bar',
    email: 'foO@bar.net',
    lang: 'en-CA',
    role: 'Admin',
    secret: 'Shh!',
  });

fixture.emptyUserSeed = async () =>
  model('q3-api-users').findByIdAndDelete(author);

fixture.author = author;
module.exports = fixture;
