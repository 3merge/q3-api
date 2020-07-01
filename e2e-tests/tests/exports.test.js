const Q3 = require('q3-api');
const mongoose = require('mongoose');
const EventSource = require('eventsource');
const Student = require('../fixtures/models/student');
const setup = require('../fixtures');

let Authorization;
let agent;
let server;

beforeAll(async () => {
  ({ Authorization, agent } = await setup());
  await Student.create([
    { name: 'Joe' },
    { name: 'Grace' },
    { name: 'Troy' },
  ]);
});

afterAll(async () => {
  await Q3.Users.deleteMany({});
  await mongoose.disconnect();
  server.close();
});

describe('Exports', () => {
  it('should call', async (done) => {
    server = Q3.$app.listen(3000, () => {
      const source = new EventSource(
        'http://127.0.0.1:3000/exports?collectionName=students',
        { https: { rejectUnauthorized: false } },
      );

      source.addEventListener('download', async () => {
        const reports = await Q3.Reports.recent();

        expect(reports).toHaveLength(1);
        done();
      });
    });
  });
});
