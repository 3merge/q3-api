const mongoose = require('mongoose');
const Model = require('../fixtures');

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

afterAll(() => {
  mongoose.disconnect();
});

describe('"middleware"', () => {
  it('should save searchable fields as ngram', async () => {
    const resp = await Model.Article.create({
      title: 'Run on middleware',
      meta: {
        keywords: ['Match', 'me'],
      },
    });

    expect(resp).toHaveProperty('ngrams');
    expect(resp.ngrams.length).toBeGreaterThan(1);
  });

  it('should save subdocuments', async () => {
    const { ngrams } = await Model.Contact.create({
      activities: [{ name: 'Jogging' }, { name: 'Biking' }],
    });

    const expectToContain = (term) =>
      expect(ngrams.includes(term)).toBeTruthy();

    expectToContain('jo');
    expectToContain('bi');
  });
});
