const VisitorOrderFull = require('../orderFull');

describe('OrderFull visitor', () => {
  describe('calculateSubtotal', () => {
    it('should return accumulation of line item subtotals', () => {
      const inst = new VisitorOrderFull();
      inst.store = {
        items: [
          { subtotal: 2134.92 },
          { subtotal: 99.11 },
          { subtotal: 123.43 },
        ],
      };

      inst.calculateSubtotal();
      expect(inst.store.subtotal).toBe(2357.46);
    });

    it('should default to 0', () => {
      const inst = new VisitorOrderFull();
      inst.calculateSubtotal();
      expect(inst.store.subtotal).toBe(0);
    });

    it('should convert null values to 0', () => {
      const inst = new VisitorOrderFull();
      inst.store = {
        paymentFee: null,
        shippingFee: undefined,
        items: [{ subtotal: 100.0 }],
      };

      inst.calculateSubtotal();
      expect(inst.store.subtotal).toBe(100.0);
    });

    it('should calculate discounts only on subtotals and process payment fees over all', () => {
      const inst = new VisitorOrderFull();
      inst.store = {
        paymentFee: 1.99,
        shippingFee: 12.99,
        globalDiscount: 10,
        fees: [{ quantity: 1, value: 0.4 }],
        items: [{ subtotal: 100 }],
      };

      inst.calculateSubtotal();
      expect(inst.store.subtotal).toBe(105.45);
    });
  });

  describe('checkTaxes', () => {
    it('should leave defaults', async () => {
      const inst = new VisitorOrderFull();
      await inst.checkTaxes({});
      expect(inst.store.gst).toBe(0);
      expect(inst.store.hst).toBe(0);
      expect(inst.store.pst).toBe(0);
    });

    it('should set the appropriate tax tables', async () => {
      const inst = new VisitorOrderFull();
      await inst.checkTaxes({
        setTax: () => ({
          gst: 11,
          pst: 2,
          hst: 0,
        }),
      });
      expect(inst.store.gst).toBe(11);
      expect(inst.store.hst).toBe(0);
      expect(inst.store.pst).toBe(2);
    });
  });

  describe('checkPaymentFees', () => {
    it('should pass paymentOption to fn', async () => {
      const inst = new VisitorOrderFull();
      const setPayment = jest.fn().mockResolvedValue(1.11);
      inst.store.paymentOption = 'Visa';
      await inst.checkPaymentFees({
        setPayment,
      });
      expect(inst.store.paymentFee).toBe(1.11);
      expect(setPayment).toHaveBeenCalledWith('Visa');
    });
  });

  describe('checkShippingFees', () => {
    it('should pass shippingOption to fn', async () => {
      const inst = new VisitorOrderFull();
      const setShipping = jest.fn().mockResolvedValue(12.32);
      inst.store.shippingOption = 'Express';
      await inst.checkShippingFees({
        setShipping,
      });
      expect(inst.store.shippingFee).toBe(12.32);
      expect(setShipping).toHaveBeenCalledWith('Express');
    });
  });

  describe('checkLocale', () => {
    it('should convert all subtotals into local currency', async () => {
      const inst = new VisitorOrderFull();
      const setLocale = jest.fn().mockResolvedValue(1.21);

      inst.store.currency = 'CAD';
      inst.store.items = [
        { currency: 'USD', subtotal: 11.99 },
        { currency: 'USD', subtotal: 6.43 },
        { currency: 'CAD', subtotal: 5.19 },
      ];

      await inst.checkLocale({
        setLocale,
      });

      expect(inst.store.items[0].subtotal).toBe(14.51);
      expect(inst.store.items[1].subtotal).toBe(7.78);
      expect(inst.store.items[2].subtotal).toBe(5.19);
      expect(inst.store.rate).toBe(1.21);
    });
  });

  describe('calculateTaxes', () => {
    it('it should add taxes and subtotals', () => {
      const inst = new VisitorOrderFull();
      inst.store = {
        subtotal: 192.99,
        pst: 0,
        hst: 1,
        gst: 2,
      };

      inst.calculateTax();
      expect(inst.store.tax).toBe(5.79);
    });

    it('it should bypass undefined taxes', () => {
      const inst = new VisitorOrderFull();
      inst.store = {
        subtotal: 192.99,
      };

      inst.calculateTax();
      expect(inst.store.tax).toBe(0);
    });
  });

  describe('calculateTotal', () => {
    it('it should merge tax and subtotal', () => {
      const inst = new VisitorOrderFull();
      inst.store = {
        subtotal: 113.42,
        tax: 11.11,
      };

      inst.calculateTotal();
      expect(inst.store.total).toBe(124.53);
    });
  });
});
