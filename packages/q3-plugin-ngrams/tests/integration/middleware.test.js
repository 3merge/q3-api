const mongoose = require('mongoose');
const Model = require('../fixtures');

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

afterAll(() => {
  mongoose.disconnect();
});

describe('"middleware"', () => {
  it('should save each searchable field as ngram', async () => {
    const resp = await Model.Article.create({
      title: 'Run on middleware',
      meta: {
        keywords: ['Match', 'me'],
      },
    });

    expect(resp).toHaveProperty('title_ngram');
    expect(resp.title_ngram.length).toBeGreaterThan(1);
    expect(resp).toHaveProperty('meta.keywords_ngram');
    expect(resp.meta.keywords_ngram.length).toBeGreaterThan(
      1,
    );
  });
});
