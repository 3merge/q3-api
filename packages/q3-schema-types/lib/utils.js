const { Schema, model } = require('mongoose');

module.exports = (SchemaType, cases) => {
  const testSchema = new Schema({
    test: SchemaType,
  });

  const M = model('CustomTypeExample', testSchema);

  describe.each(cases)(
    'Schema value "%s"',
    (v, expected) => {
      test('should validate expectedly', () => {
        const doc = new M({ test: v });
        const err = doc.validateSync();
        return expected
          ? expect(err).toBeUndefined()
          : expect(err.errors.test).toBeDefined();
      });
    },
  );

  return M;
};
