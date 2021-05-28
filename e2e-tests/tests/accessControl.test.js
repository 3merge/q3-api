const setup = require('../fixtures');
const { teardown } = require('../helpers');

let agent;
let Authorization;
let num = 0;

const genStudent = async () => {
  // eslint-disable-next-line
  num++;

  const email = `developer+${num}@3merge.ca`;
  const { Authorization: DevAuth } = await setup(
    email,
    'Developer',
  );

  const {
    body: { student },
  } = await agent
    .post('/students')
    .send({
      name: 'Mike',
      age: 24,
      friends: [
        {
          name: 'Hanna',
          age: 31,
        },
      ],
    })
    .set({ Authorization: DevAuth })
    .expect(201);

  expect(student.createdBy).toHaveProperty('email', email);
  expect(student.createdBy).toHaveProperty('role');
  expect(student.createdBy).not.toHaveProperty('isBlocked');

  return student;
};

const deleteStudent = async (statusCode) => {
  const { id } = await genStudent();

  return agent
    .delete(`/students/${id}`)
    .set({ Authorization })
    .expect(statusCode);
};

describe('Access control plugin', () => {
  describe('Developer role type', () => {
    afterAll(teardown);

    beforeAll(async () => {
      ({ Authorization, agent } = await setup(
        'developer@3merge.ca',
        'Developer',
      ));
    });

    it('should permit DELETE op', async () =>
      deleteStudent(204));

    it('should not permit DELETE op on nested field', async () => {
      const { id, friends } = await genStudent();
      const [{ id: friendId }] = friends;

      return agent
        .delete(`/students/${id}/friends/${friendId}`)
        .set({ Authorization })
        .expect(403);
    });

    it('should not update the age property', async () => {
      const { id, age, name } = await genStudent();

      const {
        body: { student },
      } = await agent
        .patch(`/students/${id}`)
        .send({ age: 40, name: 'Fred' })
        .set({ Authorization })
        .expect(200);

      expect(age).toBe(student.age);
      expect(name).not.toBe(student.name);
    });

    it('should redact GET response', async () => {
      const { id } = await genStudent();

      const {
        body: { students },
      } = await agent
        .get('/students')
        .set({ Authorization })
        .expect(200);

      const {
        body: { student },
      } = await agent
        .get(`/students/${id}`)
        .set({ Authorization })
        .expect(200);

      expect(
        students.every(
          (stu) =>
            stu.socialStatus === undefined &&
            stu.name !== undefined,
        ),
      ).toBeTruthy();

      expect(student).not.toHaveProperty('socialStatus');
    });
  });

  describe('Developer role type', () => {
    afterAll(teardown);

    beforeAll(async () => {
      ({ Authorization, agent } = await setup(
        'general@3merge.ca',
        'General',
      ));
    });

    it('should not permit DELETE op', async () =>
      deleteStudent(403));
  });
});
