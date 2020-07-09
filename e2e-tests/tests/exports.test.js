const Student = require('../fixtures/models/student');
const setup = require('../fixtures');
const connectToSocket = require('../helpers/connectToSocket');
const { teardown } = require('../helpers');

let Authorization;
let agent;

beforeAll(async () => {
  ({ Authorization, agent } = await setup());

  await Student.create([
    { name: 'Joe' },
    { name: 'Grace' },
    { name: 'Troy' },
  ]);
});

afterAll(teardown);

describe('Exports', () => {
  it('should emit server side event when a new export is ready', async (done) => {
    const socket = await connectToSocket();

    socket.on('exports', ({ data }) => {
      expect(data).toHaveLength(1);
      done();
    });

    return agent
      .post('/exports?template=students ')
      .set({
        Authorization,
      })
      .expect(204);
  });
});
