const setup = require('../fixtures');
const { teardown } = require('../helpers');
const Student = require('../fixtures/models/student');

let agent;
let Authorization;

const genStudent = async () =>
  Student.create({
    name: 'Mike',
    age: 24,
    friends: [
      {
        name: 'Hanna',
        age: 31,
      },
    ],
  });

const deleteStudent = async (statusCode) => {
  const { _id } = await genStudent();

  return agent
    .delete(`/students/${_id}`)
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
      const { _id: id, friends } = await genStudent();
      const [{ _id: friendId }] = friends;

      return agent
        .delete(`/students/${id}/friends/${friendId}`)
        .set({ Authorization })
        .expect(403);
    });

    it('should not update the age property', async () => {
      const { _id: id, age, name } = await genStudent();

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
      const { _id: id } = await genStudent();

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
        students.every((stu) => {
          return (
            stu.socialStatus === undefined &&
            stu.name !== undefined
          );
        }),
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
