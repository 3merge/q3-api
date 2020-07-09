const AC = require('./accessControl');

const {
  filterByColl,
  filterByOp,
  meetsDocumentRequirements,
  meetsUserRequirements,
  hasFields,
} = require('../helpers');

module.exports = class Grant {
  constructor(user) {
    this.$user = user;
    this.$records = AC.get(user ? user.role : 'Public');

    this.hasCheckedColl = true;
    this.hasCheckedOp = false;
  }

  first() {
    return this.$records[0];
  }

  can(op) {
    this.$records = filterByOp(this.$records, op);
    this.hasCheckedOp = true;
    return this;
  }

  on(coll) {
    this.$records = filterByColl(this.$records, coll);
    this.hasCheckedColl = true;
    return this;
  }

  test(doc) {
    if (!this.hasCheckedColl)
      throw new Error('Grant must first check collection');
    if (!this.hasCheckedOp)
      throw new Error('Grant must first check operation');

    this.$records = this.$records
      .filter(hasFields)
      .filter((grant) =>
        meetsUserRequirements(grant, this.$user),
      )
      .filter((grant) =>
        meetsDocumentRequirements(grant, doc),
      );

    return this.first();
  }
};
