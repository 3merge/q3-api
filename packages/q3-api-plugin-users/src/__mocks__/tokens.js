export const verifyToken = jest.fn();
export const generateRandomSecret = jest
  .fn()
  .mockReturnValue('shh!');
export const createHash = jest
  .fn()
  .mockReturnValue('hash!');
export const compareWithHash = jest.fn();
