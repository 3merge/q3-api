const { errors } = require('../../helpers/errors');
const validate = require('../validator').__get__(
  'validate',
);

const { ValidationError } = errors;
const req = { body: {} };
const res = {};
const next = jest.fn();

beforeEach(() => {
  next.mockReset();
});

describe('validate', () => {
  it('should catch validation errors', () => {
    req.body = null;
    validate(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.any(ValidationError),
    );
  });

  it('should proceed without errors', () => {
    req.body = {
      id: 1,
      firstName: 'Jon',
      lastName: 'Doe',
      dropNull: null,
      dropUndefined: undefined,
    };

    validate(req, res, next);
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
