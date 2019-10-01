module.exports = jest.fn().mockReturnValue({
  putPrivate: jest.fn().mockImplementation((v) => v),
  putPublic: jest.fn().mockImplementation((v) => v),
  getPrivate: jest.fn(),
  listPrivate: jest.fn(),
  listPublic: jest.fn(),
  deletePrivate: jest.fn(),
  deletePublic: jest.fn(),
});
