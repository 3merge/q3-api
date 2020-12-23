const mongoose = require('mongoose');
const Model = require('../fixtures');

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
  await Model.seed();
});

afterAll(() => {
  mongoose.disconnect();
});

describe.each([
  ['pipe', 1],
  ['hog', 1],
  ['friends', 1],
  ['of cheese', 1],
  ['"the north wind"', 1],
  ['ong', 1],
  ['oaks', 1],
  ['su', 2],
])('.fuzzy(%s)', (str, expected) => {
  it(`returns ${expected} result(s)`, async () => {
    const _id = await Model.Article.fuzzy(str);
    const results = await Model.Article.find({ _id });
    expect(results).toHaveLength(expected);
  });
});

describe.each([
  ['aferronei@cnn.com', 1],
  ['boo', 2],
  ['416', 2],
])('.fuzzy(%s)', (str, expected) => {
  it.only(`returns ${expected} result(s)`, async () => {
    const _id = await Model.Contact.fuzzy(str);
    const results = await Model.Contact.find({ _id });
    expect(results).toHaveLength(expected);
  });
});
