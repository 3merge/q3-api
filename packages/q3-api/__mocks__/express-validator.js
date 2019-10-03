module.exports = {
  matchedData: (v) => v.body,
  validationResult: jest.fn().mockImplementation((v) => ({
    throw: () => {
      if (!v || !v.body) {
        const err = new Error();
        err.mapped = jest.fn();
        throw err;
      }
      return v;
    },
  })),
};
