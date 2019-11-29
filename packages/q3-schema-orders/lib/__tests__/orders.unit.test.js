/* eslint-disable max-classes-per-file, class-methods-use-this, no-console, lines-between-class-members */
const iOrderBuilder = require('..');

let con;

beforeAll(() => {
  con = jest.spyOn(global.console, 'warn');
});

describe('OrderInterface', () => {
  it('should fail to instantiate without the required methods', () => {
    class Invalid extends iOrderBuilder {}
    expect(() => new Invalid()).toThrowError();
  });

  it('should report warnings in the console of recommended methods', () => {
    class Valid extends iOrderBuilder {
      setItemBucket() {}
      setItemUnmodifiedPrice() {}
      setLocale() {}
      setPayment() {}
      setShipping() {}
      setTax() {}
    }

    const i = new Valid();
    expect(i).toBeDefined();
    expect(con).toHaveBeenCalled();
  });

  it('should instantiate cleanly', () => {
    class Valid extends iOrderBuilder {
      setItemBucket() {}
      setItemUnmodifiedPrice() {}
      setLocale() {}
      setPayment() {}
      setShipping() {}
      setTax() {}
      automateItemDiscounts() {}
      automateItemRebates() {}
      automateItemFees() {}
      automateRebates() {}
      automateDiscounts() {}
      automateFees() {}
    }

    const i = new Valid();
    expect(i).toBeDefined();
    expect(con).toHaveBeenCalled();
  });
});
