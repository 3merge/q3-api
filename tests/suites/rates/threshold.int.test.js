/* eslint-disable import/no-extraneous-dependencies */
const { connect, model, disconnect } = require('mongoose');
const Schema = require('q3-schema-rates');

let Model;
const stub = { name: 'Foo', value: 1.1 };

beforeAll(async () => {
  Model = model('RATES_FOO', Schema);
  await connect(process.env.CONNECTION);
  await Model.create(stub);
});

afterAll(async () => {
  await Model.deleteMany({});
  await disconnect();
});

describe('Rates static finder', () => {
  it('should return match on strict equals', async () => {
    const doc = await Model.create({
      name: 'Bar',
      value: 1,
      threshold: '==142.1',
    });

    expect(doc.meetsThreshold(142.1)).toBeTruthy();
    expect(doc.meetsThreshold(12)).toBeFalsy();
  });

  it('should return match on greater than', async () => {
    const doc = await Model.create({
      name: 'Quuz',
      value: 1,
      threshold: '>142.1',
    });

    expect(doc.meetsThreshold(142.2)).toBeTruthy();
    expect(doc.meetsThreshold(142.1)).toBeFalsy();
  });
});
