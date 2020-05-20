const Q3 = require('q3-api');
const supertest = require('supertest');
const mongoose = require('mongoose');
const setup = require('../fixtures');
const Student = require('../fixtures/models/student');

let agent;
let user;
let Authorization;

beforeAll(async () => {
  process.env.SECRET = 'SECRET';
  user = await setup('access@control.ca');
  agent = supertest(Q3.$app);

  await user
    .set({
      secret: 'Shh!',
      verified: true,
    })
    .setPassword();

  Authorization = `Apikey ${await user.generateApiKey()}`;
  agent = supertest(Q3.$app);
});

afterAll(async () => {
  await Q3.Users.deleteMany({});
  await mongoose.disconnect();
});

describe('Version control plugin', () => {
  it('should DELETE', async () => {
    const s = await Student.create({
      name: 'Mike',
    });

    return agent
      .delete(`/students/${s._id}`)
      .set({ Authorization })
      .expect(403);
  });

  it('should not DELETE', async () => {
    const s = await Student.create({
      name: 'Mike',
      friends: [
        {
          name: 'Hanna',
          age: 31,
        },
      ],
    });

    return agent
      .delete(`/students/${s._id}`)
      .set({ Authorization })
      .expect(204);
  });
});
