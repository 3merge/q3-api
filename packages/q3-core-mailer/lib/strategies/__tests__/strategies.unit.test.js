const strat = require('..');

test('Strategies should run on known service providers', () => {
  expect(strat('Unknown')).rejects.toThrowError();
});
