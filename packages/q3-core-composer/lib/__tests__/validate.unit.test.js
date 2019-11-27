const { validateBody } = require('../validate');

const req = { body: {} };
const res = {};
const next = jest.fn();

jest.mock('express-validator');

beforeEach(() => {
  next.mockReset();
});

describe('validate', () => {
  it('should catch validation errors', () => {
    req.body = null;
    validateBody(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should proceed without errors', () => {
    req.body = {
      id: 1,
      firstName: 'Jon',
      lastName: 'Doe',
      dropNull: null,
      dropUndefined: undefined,
    };

    validateBody(req, res, next);
    expect(req.body).not.toHaveProperty('dropNull');
    expect(req.body).not.toHaveProperty('dropUndefined');
    expect(req.body).toMatchObject({
      id: 1,
      firstName: 'Jon',
      lastName: 'Doe',
    });

    expect(next).toHaveBeenCalled();
  });
});
