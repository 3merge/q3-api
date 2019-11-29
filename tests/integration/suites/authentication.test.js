const { Users } = require('q3-api');
const [{ email }] = require('../fixtures/stubs/users.json');

let token;
let nonce;
let key;

const host = 'localhost';

const getBearerAuth = () => ({
  Authorization: `Bearer ${token}`,
  'X-Session-Nonce': nonce,
  host,
});

const getKeyAuth = () => ({
  Authorization: `Apikey ${key}`,
});

describe('Q3 authentication flow', () => {
  it('should require login', () =>
    global.agent.get('/profile').expect(401));

  it('should reset the password', () =>
    global.agent
      .post('/password-reset')
      .send({ email })
      .expect(200));

  it('should find email', () =>
    global.agent
      .get(`/authenticate?email=${email}`)
      .expect(204));

  it('should permit login', async () => {
    const doc = await Users.findOne({ email });
    const password = await doc.setPassword();

    ({
      body: { token, nonce },
    } = await global.agent
      .post('/authenticate')
      .send({ email, password })
      .set({ host })
      .expect(201));
  });

  it('should generate API key', async () => {
    ({
      body: { key },
    } = await global.agent
      .post('/apikey')
      .set(getBearerAuth())
      .expect(201));
  });

  it('should get system information', () =>
    global.agent
      .get('/system')
      .set(getKeyAuth())
      .expect(200));
});
