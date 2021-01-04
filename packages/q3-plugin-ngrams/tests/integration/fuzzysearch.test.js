const mongoose = require('mongoose');
const Model = require('../fixtures');
const {
  MAX_GRAM_SIZE,
  MIN_GRAM_SIZE,
} = require('../../lib/constants');

const expectEvery = (a = [], cb) =>
  expect(a.every(cb)).toBeTruthy();

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
    const { ngrams } = await Model.Article.findOne({
      description: {
        $exists: true,
      },
    }).select('ngrams');

    expectMin(ngrams, MIN_GRAM_SIZE);
    expectMax(ngrams, MAX_GRAM_SIZE);
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
