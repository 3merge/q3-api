const { Users } = require('q3-api');

let Authorization;

beforeAll(async () => {
  const doc = await Users.findOne({
    email: 'mary-anne-secret@yahoo.ca',
  });

  await doc.setPassword();
  Authorization = await doc.generateApiKey();
});

describe('Q3 authentication flow', () => {
  it('should require login', () =>
    global.agent.get('/products').expect(403));

  it('should redact create request body', async () => {
    const { body } = await global.agent
      .post('/products')
      .send({
        sku: 'Lightbulk',
        manufacturerSku: 'manufacturerCode',
      })
      .set({ Authorization })
      .expect(201);

    expect(body.product).not.toHaveProperty(
      'manufacturerCode',
    );
  });

  it('should redact create request body', async () => {
    await global.agent
      .post('/orders')
      .send()
      .expect(201);

    await global.agent
      .post('/orders')
      .send()
      .set({ Authorization })
      .expect(201);

    const { body } = await global.agent
      .get('/orders')
      .send()
      .set({ Authorization })
      .expect(200);

    expect(body.orders).toHaveLength(1);
  });
});
