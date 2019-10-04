const Q3 = require('q3-api');
const moment = require('moment');
const supertest = require('supertest');
const plugin = require('..');
const { MODEL_NAME } = require('../constants');

let agent;
let token;
let nonce;
let newPassword;

const secret = 'SHH!';
const password = 'TiS!87324~@#';
const host = 'localhost';

const seed = [
  {
    firstName: 'Demetrius',
    lastName: 'Moxsom',
    email: 'dmoxsom0@so-net.ne.jp',
    lang: 'en-CA',
    role: 'Admin',
    secret,
  },
  {
    firstName: 'Sharia',
    lastName: 'McKane',
    email: 'smckane1@un.org',
    lang: 'fr-CA',
    role: 'Sales',
    secret,
  },
  {
    firstName: 'Vincenz',
    lastName: 'Domino',
    email: 'vdomino2@telegraph.co.uk',
    lang: 'en-CA',
    role: 'Customer',
    secret,
  },
];

const seedUserDB = () =>
  Q3.model(MODEL_NAME)
    .create(seed)
    .then(([admin, sales]) => {
      return Promise.all([
        admin.setPassword(password),
        sales.setPassword(),
      ]);
    });

beforeAll(async () => {
  process.env.SECRET = 'FORENC';
  agent = supertest(Q3.init());
  Q3.register(plugin);
  await Q3.connect().then((e) =>
    e ? Promise.resolve(e) : seedUserDB(),
  );
});

describe('authenticate', () => {
  it('should return 422', (done) => {
    agent
      .post('/authenticate')
      .send({ email: 'email@gmail.com' })
      .expect(422)
      .end(done);
  });

  it('should return 403', async () => {
    await Q3.model(MODEL_NAME).findOneAndUpdate(
      { email: 'smckane1@un.org' },
      { loginAttempts: 10 },
    );

    await agent
      .post('/authenticate')
      .send({
        email: 'smckane1@un.org',
        password,
      })
      .expect(403);
  });

  it('should return 401', (done) => {
    agent
      .post('/authenticate')
      .send({
        email: 'dmoxsom0@so-net.ne.jp',
        password: 'noop',
      })
      .expect(401)
      .end(done);
  });

  it('should return 201', (done) => {
    agent
      .post('/authenticate')
      .set({ host })
      .send({
        email: 'dmoxsom0@so-net.ne.jp',
        password,
      })
      .expect(({ body, status }) => {
        ({ token, nonce } = body);
        expect(body).toHaveProperty('token');
        expect(body).toHaveProperty('nonce');
        expect(status).toBe(201);
      })
      .end(done);
  });
});

describe('verify', () => {
  let id;

  beforeAll(async () => {
    ({ _id: id } = await Q3.model(MODEL_NAME).findOne({
      email: 'vdomino2@telegraph.co.uk',
    }));
  });

  it('should return 409', async () => {
    const psw = 'Hey!';
    await Q3.model(MODEL_NAME).findByIdAndUpdate(id, {
      secretIssuedOn: moment().subtract(5, 'days'),
    });

    await agent
      .post('/verify')
      .send({
        id,
        verificationCode: secret,
        password: psw,
        confirmNewPassword: psw,
      })
      .expect(409);
  });

  it('should return 401', async () => {
    const psw = 'Hey!';
    await agent
      .post('/verify')
      .send({
        id,
        verificationCode: 'notcorrect',
        password: psw,
        confirmNewPassword: psw,
      })
      .expect(401);
  });

  it('should return 204', async () => {
    const psw = 'MUST&(y3747236#$^';
    const mock = jest.fn();

    await Q3.model(MODEL_NAME).findByIdAndUpdate(id, {
      secretIssuedOn: moment(),
    });

    await agent
      .post('/verify')
      .send({
        id,
        verificationCode: secret,
        password: psw,
        confirmNewPassword: psw,
      })
      .expect(204);

    expect(mock).toHaveBeenCalledWith({
      email: expect.any(String),
    });
  });
});

describe('reverify', () => {
  it('should return 401', (done) => {
    agent
      .post('/reverify')
      .send({
        email: 'vdomino2@telegraph.co.uk',
      })
      .expect(401)
      .end(done);
  });

  it('should return 204', async () => {
    const email = 'smckane1@un.org';
    const mock = jest.fn();
    await Q3.model(MODEL_NAME).findOneAndUpdate(
      { email },
      { verified: false },
    );

    await agent
      .post('/reverify')
      .send({
        email,
      })
      .expect(204);

    expect(mock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        email: expect.any(String),
        secret: expect.any(String),
      }),
    );
  });
});

describe('reset password', () => {
  it('should return 401', (done) => {
    agent
      .post('/reset-password')
      .send({
        email: 'unknownemail@gmail.com',
      })
      .expect(401)
      .end(done);
  });

  it('should return 204', async () => {
    const mock = jest
      .fn()
      .mockImplementation(({ password: psw }) => {
        newPassword = psw;
      });
    await agent
      .post('/reset-password')
      .send({
        email: 'dmoxsom0@so-net.ne.jp',
      })
      .expect(204);
    expect(mock).toHaveBeenCalledWith({
      email: expect.any(String),
      password: expect.any(String),
    });
  });
});

describe('password update', () => {
  it('should return 204', async () => {
    const psw = 'ihuert897&*(55412TTT';

    await agent
      .post('/update-password')
      .set({
        'Authorization': `bearer ${token}`,
        'exp-nonce': nonce,
        host,
      })
      .send({
        email: 'dmoxsom0@so-net.ne.jp',
        previousPassword: newPassword,
        confirmNewPassword: psw,
        newPassword: psw,
      })
      .expect(204);
  });
});

describe('profile', () => {
  it('should return 401', (done) => {
    agent
      .get('/profile')
      .expect(401)
      .end(done);
  });
});
