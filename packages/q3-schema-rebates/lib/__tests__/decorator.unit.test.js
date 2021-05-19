const { model, connect, disconnect } = require('mongoose');
const Schema = require('..');

let M;

const rebates = [
  {
    name: 'Without conditions',
    description: 'Used for simple target matching',
    value: 12,
    requiredSkus: 'A9D0',
    symbol: '%',
    currency: 'CAD',
    effectiveFrom: '',
    expiresOn: '',
  },
  {
    name: 'With conditions',
    description: 'Used for incrementing value',
    value: 8,
    maximum: 5,
    requiredSkus: 'A9D9',
    conditionalSkus: 'BC7812, BC0978',
    conditionalSkuThreshold: 10,
    symbol: '$',
    currency: 'USD',
    effectiveFrom: '',
    expiresOn: '',
  },
  {
    name: 'With tiers',
    description: 'Used for incrementing value',
    value: 8,
    maximum: 5,
    // couponCode: 'HELLO',
    requiredSkus: 'AB89',
    symbol: '=',
    currency: 'CAD',
    tiers: [{ quantity: 5, value: 7 }],
    effectiveFrom: '',
    expiresOn: '',
  },
];

const makeItems = (vals) =>
  vals.map((val, i) => ({ id: i, quantity: val }));

beforeAll(async () => {
  M = await model(
    `Rebate_Deco_${new Date().toISOString()}`,
    Schema,
  );
  connect(process.env.CONNECTION);
});

afterAll(async () => {
  await disconnect();
});

describe('RebateDecorator', () => {
  beforeAll(async () => {
    await M.create(rebates);
  });

  describe('findApplicable', () => {
    it('should return matching rebates without a code', async () => {
      const resp = await M.findApplicable(null, [
        { sku: 'A9D0', quantity: 7 },
        { sku: 'BC7812', quantity: 19 },
        { sku: 'BC0978', quantity: 2 },
      ]);

      expect(resp).toHaveLength(1);
    });
  });

  describe('reduceQualifiedRebates', () => {
    it('should return with pricing and quantities', async () => {
      const d = await M.reduceQualifiedRebates(null, [
        {
          id: 1,
          sku: 'A9D0',
          price: 9.99,
          quantity: 4,
          currency: 'CAD',
        },
        {
          id: 2,
          sku: 'FOO',
          price: 19.99,
          quantity: 8,
          currency: 'USD',
        },
      ]);

      expect(d[0].applicableTo).toHaveLength(1);
      expect(d[0].applicableTo[0]).toMatchObject({
        id: 1,
        value: 1.19,
        amount: 4,
      });
    });
  });

  describe('getMaximumAmounts', () => {
    it('should not limit quantity', async () => {
      const rebate = await M.findOne();
      return expect(
        rebate.getMaximumAmounts(makeItems([6, 2, 5])),
      ).toEqual([6, 2, 5]);
    });

    it('should limit by history', async () => {
      const rebate = await M.findOne();
      const mock = jest.fn().mockResolvedValue(2);
      rebate.queryHistory = mock;
      rebate.maximumPerHistory = 10;
      await rebate.setHistoricalCount();

      return expect(
        rebate.getMaximumAmounts(makeItems([6, 2, 5])),
      ).toEqual([6, 2, 0]);
    });

    it('should limit by sum', async () => {
      const rebate = await M.findOne();
      rebate.maximumPerOrder = 5;
      return expect(
        rebate.getMaximumAmounts(makeItems([6, 2, 5])),
      ).toEqual([5, 0, 0]);
    });

    it('should limit by sum despite product line being equal', async () => {
      const rebate = await M.findOne();
      rebate.maximumPerOrder = 5;
      rebate.maximumPerProduct = 5;
      return expect(
        rebate.getMaximumAmounts(makeItems([6, 2, 5])),
      ).toEqual([5, 0, 0]);
    });

    it('should limit by line', async () => {
      const rebate = await M.findOne();
      rebate.maximumPerProduct = 3;

      return expect(
        rebate.getMaximumAmounts(
          makeItems([6, 2, 5, 12, 5]),
        ),
      ).toEqual([3, 2, 3, 3, 3]);
    });

    it('should throttle line limit if order sum is lower', async () => {
      const rebate = await M.findOne();
      rebate.maximumPerProduct = 3;
      rebate.maximumPerOrder = 2;

      return expect(
        rebate.getMaximumAmounts(
          makeItems([6, 2, 5, 12, 5]),
        ),
      ).toEqual([2, 0, 0, 0, 0]);
    });

    it('should limit in combination', async () => {
      const rebate = await M.findOne();
      rebate.maximumPerProduct = 5;
      rebate.maximumPerOrder = 12;
      rebate.maximumPerHistory = 21;

      return expect(
        rebate.getMaximumAmounts(makeItems([6, 2, 4, 5])),
      ).toEqual([5, 2, 4, 1]);
    });

    it('should return full quantities without maximums', () => {
      const rebate = new M({});
      return expect(
        rebate.getMaximumAmounts(makeItems([12, 10])),
      ).toEqual([12, 10]);
    });
  });

  describe('greatestPotentialValue', () => {
    it('should sort by throttled quantity', async () => {
      const rebate = await M.findOne();
      rebate.maximumPerProduct = 1;
      rebate.maximumPerOrder = 12;
      const input = [
        { price: 50, quantity: 3 },
        { price: 23, quantity: 15 },
      ];
      const output = rebate.greatestPotentialValue(input);
      expect(output).toEqual([
        {
          price: 50,
          quantity: 3,
        },
        {
          price: 23,
          quantity: 15,
        },
      ]);
    });

    it('should sort by sum', async () => {
      const rebate = await M.findOne();
      const input = [
        { price: 50, quantity: 3 },
        { price: 23, quantity: 15 },
      ];
      const output = rebate.greatestPotentialValue(input);
      expect(output).toEqual([
        {
          price: 23,
          quantity: 15,
        },
        {
          price: 50,
          quantity: 3,
        },
      ]);
    });
  });

  describe('evaluation', () => {
    it('should subtract value', async () => {
      const r = await M.create({
        value: 12,
        symbol: '$',
        currency: 'CAD',
        name: '12 dollars off',
        description: 'Req',
        requiredSkus: 'Foo',
      });

      expect(r.evaluate({ price: 100 })).toBe(12);
    });

    it('should reference dynamic price', async () => {
      const r = await M.create({
        value: 12,
        symbol: '%',
        currency: 'CAD',
        name: '12% off',
        description: 'Req',
        requiredSkus: 'Foo',
      });

      expect(r.evaluate({ getPrice: () => 50 })).toBe(6);
    });

    it('should reduce by x-percent', async () => {
      const r = await M.create({
        value: 10,
        symbol: '%',
        currency: 'CAD',
        name: '10 percent off',
        description: 'Req',
        requiredSkus: 'Foo',
      });

      expect(r.evaluate({ price: 100 })).toBe(10);
    });

    it('should reduce by tiered dollar value', async () => {
      const r = await M.create({
        value: 10,
        symbol: '=',
        name: '10 dollars off',
        description: 'Req',
        tiers: [{ value: 8, quantity: 5 }],
        requiredSkus: 'Foo',
      });

      expect(
        r.evaluate({
          price: 100,
          currency: 'CAD',
          quantity: 10,
        }),
      ).toBe(92);
    });
  });

  describe('"hasConditionalSkus"', () => {
    let conditionalFixture;
    const sku = 'ABC';

    const getItem = (quantity) => ({
      sku,
      quantity,
    });

    beforeEach(() => {
      conditionalFixture = new M({
        conditionalSkus: [sku],
        conditionalSkuThreshold: 12,
      });
    });

    it('should return truthy on equal to', () => {
      expect(
        conditionalFixture.hasConditionalSkus([
          getItem(12),
        ]),
      ).toBeTruthy();
    });

    it('should return falsy on less than', () => {
      expect(
        conditionalFixture.hasConditionalSkus([getItem(5)]),
      ).toBeFalsy();
    });
  });
});
