export const validationResult = jest.fn().mockReturnValue({
  throw: jest
    .fn()
    .mockImplementationOnce(() => {
      // eslint-disable-next-line
    throw {
        mapped: jest.fn(),
      };
    })
    .mockImplementation(jest.fn),
});

export const matchedData = jest.fn().mockReturnValue({
  id: 1,
  firstName: 'Jon',
  lastName: 'Doe',
  dropNull: null,
  dropUndefined: undefined,
});
