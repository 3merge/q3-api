const mongoose = require('mongoose');
const Model = require('../fixtures');

const expectEvery = (a = [], cb) =>
  expect(a.every(cb)).toBeTruthy();

const expectLength = (attr) =>
  expect(attr.length).toBeGreaterThan(1);

const expectMax = (a = [], max = 0) =>
  expectEvery(a, (v) => v.length <= max);

const expectMin = (a = [], min = 0) =>
  expectEvery(a, (v) => v.length >= min);

const findOn = (modelName, str) =>
  Model[modelName].find(
    Model[modelName].getFuzzyQuery(str),
  );

const makeTableCase = (modelName) => (
  searchTerm,
  expectedLength,
) => {
  it(`returns ${expectedLength} ${modelName} result(s) on ${searchTerm}`, async () =>
    expect(
      await findOn(modelName, searchTerm),
    ).toHaveLength(expectedLength));
};

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
  await Model.seed();
});

afterAll(() => {
  mongoose.disconnect();
});

describe('"initializeFuzzySearching"', () => {
  it('should assign ngram fields based on schema options', async () => {
    const {
      title_ngram: title,
      description_ngram: desc,
    } = await Model.Article.findOne().select(
      'title_ngram description_ngram',
    );

    expectLength(title);
    expectMin(title, 2);
    expectLength(desc);
    expectMax(desc, 6);
  });
});

describe.each([
  ['pipe', 1],
  ['hog', 1],
  ['friends', 1],
  ['of cheese', 1],
  ['north wind sun', 2],
  ['rong', 2],
  ['su', 4],
  ['theres', 1],
  ['accessibl', 1],
])('.fuzzy(%s)', makeTableCase('Article'));

describe.each([
  ['aferronei@cnn.com', 1],
  ['boo', 2],
  ['416', 2],
])('.fuzzy(%s)', makeTableCase('Contact'));
