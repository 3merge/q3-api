const path = require('path');
const i18 = require('../i18next');

test('Instance has languages loaded already', () => {
  expect(
    i18.hasResourceBundle('en', 'labels'),
  ).toBeTruthy();
});

test('loadTranslationFromDirectory should find all default locale files', () => {
  i18.walker(path.resolve(__dirname, '../../..'));
});
