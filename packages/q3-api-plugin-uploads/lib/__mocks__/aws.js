module.exports = jest.fn().mockReturnValue({
  deleteByKey: jest.fn(),
  addToBucket: () =>
    jest.fn().mockImplementation(([, { name }]) => name),
  getPrivate: jest
    .fn()
    .mockImplementation((name) => `${name}?shh!`),
  getPublic: jest
    .fn()
    .mockImplementation(
      (name) => `${process.env.CDN}/${name}`,
    ),
});
