const { first, orderBy, last, get } = require('lodash');

const getInt = (v) => (i) => Number(v.split(i)[1]);

const checkOp = (v) => (op) =>
  v.startsWith(op) ? v : null;

module.exports = class RatesDecorator {
  static async findAndFilterByThreshold(query = {}, value) {
    const rates = await this.find(query).exec();
    return Array.isArray(rates)
      ? rates.filter((rate) => rate.meetsThreshold(value))
      : [];
  }

  static async findAndReduceByThreshold(...params) {
    const rates = await this.findAndFilterByThreshold(
      ...params,
    );

    const sortByOp = [last(params)];
    const sorted = orderBy(rates, ['value'], sortByOp);
    return get(first(sorted), 'value', 0);
  }

  static async findAndReduceByThresholdAsc(...params) {
    return this.findAndReduceByThreshold(...params, 'asc');
  }

  static async findAndReduceByThresholdDesc(...params) {
    return this.findAndReduceByThreshold(...params, 'desc');
  }

  meetsThreshold(v) {
    const { threshold } = this;

    const execComparison = (equation) => {
      const compare = getInt(equation);
      const fn = checkOp(equation);

      switch (equation) {
        case fn('=='):
          return v === compare('==');
        /**
         *@NOTE
         * Case order is important for ops that start with the same characters.
         * For instance, > would supersede >= otherwise.
         */
        case fn('<='):
          return v <= compare('<=');
        case fn('>='):
          return v >= compare('>=');
        case fn('>'):
          return v > compare('>');
        case fn('<'):
          return v < compare('<');
        default:
          return true;
      }
    };

    return threshold
      ? threshold.split('&').every(execComparison)
      : true;
  }
};
