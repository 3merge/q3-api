import { ValidationError } from '../../helpers/errors';

const testUtils = require('../validator');

const validate = testUtils.__get__('validate');
const req = { body: {} };
const res = {};
const next = jest.fn();

beforeEach(() => {
  next.mockReset();
});

describe('validate', () => {
  it('should catch validation errors', () => {
    validate(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.any(ValidationError),
    );
  });

  it('should catch validation errors', () => {
    validate(req, res, next);
    expect(req.body).not.toHaveProperty('dropNull');
    expect(req.body).not.toHaveProperty('dropUndefined');
    expect(req.body).toMatchObject(
      expect.objectContaining({
        id: 1,
        firstName: 'Jon',
        lastName: 'Doe',
      }),
    );
    expect(next).toHaveBeenCalled();
  });
});
