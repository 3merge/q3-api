const moment = require('moment');
const MockModel = require('q3-test-utils/helpers/modelMock');
const Decorator = require('../methods');
const { compareWithHash } = require('../helpers');

jest.mock('../helpers', () => ({
  generateAPIKey: () => 'shh!',
  generateRandomSecret: () => 'shh!',
  createHash: jest.fn().mockResolvedValue('hash!'),
  compareWithHash: jest.fn(),
  verifyToken: jest.fn(),
}));

const id = 'foo';
const email = 'jon.doe@gmail.com';
const findOne = jest.fn();
const save = jest.fn().mockResolvedValue(null);

const willReject = async (fn) => {
  const { rejects } = expect(fn);
  await rejects.toThrowError();
};

const willResolveObject = async (fn, obj) => {
  expect(await fn).toMatchObject(obj);
};

const set = jest
  .fn()
  .mockImplementation(function preserveThisState(obj) {
    Object.assign(this, obj);
  });

const doc = {
  id,
  email,
};

const findAsMissing = () => findOne.mockResolvedValue(null);

const findUser = (args = {}) =>
  MockModel.exec.mockResolvedValue({
    ...args,
    ...doc,
  });

beforeEach(() => {
  findOne.mockReset();
  MockModel.reset();
});

describe('$findOneStrictly', () => {
  it('should throw an error if user not found', async () => {
    findAsMissing();
    await willReject(
      Decorator.$findOneStrictly.call({ findOne }),
    );
  });

  it('should return document', async () => {
    findUser();
    await willResolveObject(
      Decorator.$findOneStrictly.call(MockModel, { email }),
      doc,
    );
    expect(MockModel.findOne).toHaveBeenCalledWith({
      email,
    });
  });
});

describe('static find abstractions', () => {
  let inst;

  beforeAll(() => {
    inst = new Decorator();
    Object.assign(inst, {
      $findOneStrictly: findOne,
      findOne,
    });
  });

  beforeEach(() => {
    findUser();
  });

  it('should query by key', async () => {
    await Decorator.findByApiKey.call(MockModel, '123');
    expect(MockModel.findOne).toHaveBeenCalledWith({
      apiKeys: '123',
    });
  });

  it('should query active users', async () => {
    await Decorator.findByEmail.call(inst, email);
    expect(findOne).toHaveBeenCalledWith({
      email,
    });
  });

  it('should query verified users by email', async () => {
    await Decorator.findVerifiedByEmail.call(inst, email);
    expect(findOne).toHaveBeenCalledWith({
      password: { $exists: true },
      email,
      verified: true,
    });
  });

  it('should query verified users by email', async () => {
    await Decorator.findVerifiedById.call(inst, id);
    expect(findOne).toHaveBeenCalledWith({
      password: { $exists: true },
      verified: true,
      _id: id,
    });
  });

  it('should query unverified users', async () => {
    await Decorator.findUnverifiedByEmail.call(inst, email);
    expect(findOne).toHaveBeenCalledWith(
      {
        verified: false,
        email,
      },
      'accountVerified',
    );
  });
});

test('setSecret should save a random string', async () => {
  const cls = new Decorator();
  await cls.setSecret();
  expect(cls.secret).toBe('shh!');
});

test('setPassword should hash the string and reset login count', async () => {
  const cls = new Decorator();
  Object.assign(cls, { save, set });
  await cls.setPassword('098234njJHJHI897234987@^*^*@');
  expect(cls).toMatchObject(
    expect.objectContaining({
      password: 'hash!',
      loginAttempts: 0,
      verified: true,
    }),
  );
  expect(save).toHaveBeenCalled();
});

test.each([
  ['TestingMe.12', true],
  ['4MyTestin!~202', true],
  ['myfirstEmail@3kg', true],
  ['myfirstEmail_3kg', true],
  ['(Secrets)1234', true],
  ['Testa20Me-', true],
  ['TestingMe_', false],
  ['test', false],
  ['test!2020', false],
])(
  '.setPassword(%s) should test strength',
  async (a, doesPass) => {
    const cls = new Decorator();
    Object.assign(cls, { save, set });
    if (doesPass) {
      expect(cls.setPassword(a)).resolves.toMatch(a);
    } else {
      expect(cls.setPassword(a)).rejects.toThrowError();
    }
  },
);

describe('verifyPassword', () => {
  it('should reset login count on success', async () => {
    compareWithHash.mockReturnValueOnce(true);
    const cls = new Decorator();
    Object.assign(cls, { save });
    expect(
      await cls.verifyPassword('iodsf09*)(5^HH', true),
    ).toBeTruthy();
    expect(save).toHaveBeenCalledWith();
    expect(cls).toMatchObject(
      expect.objectContaining({
        isNew: false,
        loginAttempts: 0,
      }),
    );
  });

  it('should increment login count', async () => {
    compareWithHash.mockReturnValueOnce(false);
    const cls = new Decorator();
    Object.assign(cls, { save });
    expect(
      await cls.verifyPassword('a', false),
    ).toBeFalsy();
    expect(save).toHaveBeenCalledWith();
    expect(cls).toMatchObject(
      expect.objectContaining({
        isNew: false,
        loginAttempts: 1,
      }),
    );
  });

  it('should increment login count and throw an error', async () => {
    compareWithHash.mockReturnValueOnce(false);
    const cls = new Decorator();
    Object.assign(cls, { save, loginAttempts: 2 });
    await willReject(cls.verifyPassword('a', true));
    expect(cls).toMatchObject(
      expect.objectContaining({
        isNew: false,
        loginAttempts: 3,
      }),
    );
  });
});

describe('isBlocked getter', () => {
  it('should return truthy', () => {
    const cls = new Decorator();
    Object.assign(cls, { loginAttempts: 6 });
    expect(cls.isBlocked).toBeTruthy();
  });

  it('should return falsy', () => {
    const cls = new Decorator();
    Object.assign(cls, { loginAttempts: 1 });
    expect(cls.isBlocked).toBeFalsy();
  });
});

describe('hasExpired getter', () => {
  it('should return truthy', () => {
    const cls = new Decorator();
    Object.assign(cls, {
      secretIssuedOn: moment().subtract(7, 'days'),
    });
    expect(cls.hasExpired).toBeTruthy();
  });

  it('should return falsy', () => {
    const cls = new Decorator();
    Object.assign(cls, {
      updatedAt: moment(),
    });
    expect(cls.hasExpired).toBeFalsy();
  });
});

describe('isPermitted getter', () => {
  it('should return truthy', () => {
    const cls = new Decorator();
    Object.assign(cls, {
      frozen: false,
      loginAttempts: 6,
    });
    expect(cls.isPermitted).toBeFalsy();
  });

  it('should return falsy', () => {
    const cls = new Decorator();
    Object.assign(cls, {
      frozen: false,
      loginAttempts: 0,
      role: 'HEY',
    });
    expect(cls.isPermitted).toBeTruthy();
  });
});

test('deactivate should render document as default', async () => {
  const cls = new Decorator();
  Object.assign(cls, {
    set,
    save,
    verified: true,

    password: 'foo!',
    secret: 'bar!',
  });
  await cls.deactivate();
  expect(cls).toMatchObject(
    expect.objectContaining({
      verified: false,
      active: false,
      password: null,
      secret: null,
    }),
  );
});

describe('generateAPIKey', () => {
  it('should insert uniquely into array', async () => {
    const cls = new Decorator();
    cls.apiKeys = [];
    cls.save = jest.fn();
    expect(await cls.generateApiKey()).toContain('shh!');
    expect(cls.save).toHaveBeenCalled();
    expect(cls.apiKeys).toHaveLength(1);
  });
});

describe('findbyBearerToken', () => {
  it('should insert uniquely into array', async () =>
    Decorator.findbyBearerToken('token', 'host'));
});

test('obfuscatePrivateFields should replace all but last four characters with asterisks', async () => {
  const cls = new Decorator();
  cls.toJSON = jest
    .fn()
    .mockImplementation(function preserverThis() {
      return this;
    });
  cls.password = 'Testing';
  cls.apiKeys = ['123456789', 'Testing123'];
  expect(await cls.obfuscatePrivateFields()).toMatchObject({
    apiKeys: ['*****6789', '******g123'],
  });
});
