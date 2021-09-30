const Q3 = require('q3-api');
const {
  compact,
  first,
  get,
  isFunction,
  last,
  isUndefined,
} = require('lodash');
const setup = require('../fixtures');
const { access, teardown } = require('../helpers');

let agent;
let Authorization;
let userSessionId;

const email = 'developer@3merge.ca';
const role = 'Developer';
const coll = 'students';

const Students = Q3.model(coll);

const genStudentId = async () =>
  get(await Students.create({}), 'id');

const makeApiPath = (...xs) =>
  `/${compact([coll].concat(xs.flat())).join('/')}`;

const setDeveloperPermissionOnStudents = (args = {}) =>
  access.findAndReplace({
    ownership: 'Any',
    ...args,
    role,
    coll,
  });

describe('Access control via REST endpoints (user ownership)', () => {
  beforeAll(async () => {
    ({
      Authorization,
      agent,
      user: { _id: userSessionId },
    } = await setup(email, role));
  });

  afterEach(async () => {
    await Students.deleteMany({});
  });

  afterAll(teardown);

  test.each([
    {
      expected: 204,
      grant: {
        fields: ['*'],
      },
    },
    {
      expected: 403,
      grant: {
        fields: null,
      },
    },
    {
      expected: 403,
      grant: {
        fields: ['friends'],
      },
    },
  ])(
    'TOP-LEVEL DELETE operations',
    async ({ grant, expected }) => {
      setDeveloperPermissionOnStudents({
        ...grant,
        op: 'Delete',
      });

      await agent
        .delete(makeApiPath(await genStudentId()))
        .set({ Authorization })
        .expect(expected);
    },
  );

  test.each([
    {
      expected: 204,
      grant: {
        fields: ['*'],
      },
    },
    {
      expected: 204,
      grant: {
        fields: ['samples*'],
      },
    },
    {
      expected: 403,
      grant: {
        fields: ['friends*'],
      },
    },
    {
      expected: 204,
      grant: {
        fields: [
          'friends',
          {
            glob: 'samples',
            wildcard: true,
            test: [
              'samples.test=Foo',
              'samples.message=Bar',
            ],
            unwind: 'samples',
          },
        ],
      },
    },
    {
      expected: 403,
      grant: {
        fields: [
          '*',
          {
            glob: 'samples',
            wildcard: true,
            negate: true,
            test: ['samples.test=Foo'],
            unwind: 'samples',
          },
        ],
      },
    },
  ])(
    'SUB_DOCUMENT DELETE operations',
    async ({ grant, expected }) => {
      setDeveloperPermissionOnStudents({
        ...grant,
        op: 'Delete',
      });

      const {
        id,
        samples: [{ _id: sampleId }],
      } = await Q3.model(coll).create({
        name: 'DeleteOp',
        samples: [
          {
            test: 'Foo',
            message: 'Bar',
          },
        ],
      });

      await agent
        .delete(makeApiPath(id, 'samples', sampleId))
        .set({ Authorization })
        .expect(expected);
    },
  );

  test.each([
    {
      body: {
        name: 'Jon',
      },
      expected: {
        status: 201,
        assertResponse: (student) =>
          expect(student).toHaveProperty('name', 'Jon'),
      },
      grant: {
        fields: ['*'],
      },
    },
    {
      body: {
        name: 'Jon',
        grade: 12,
      },
      expected: {
        status: 201,
        assertResponse: (student) => {
          expect(student).toHaveProperty('name', 'Jon');
          expect(student).not.toHaveProperty('grade');
        },
      },
      grant: {
        fields: ['!grade'],
      },
    },
    {
      body: {
        name: 'Jon',
        grade: 4,
        age: 11,
      },
      expected: {
        status: 201,
        assertResponse: (student) => {
          expect(student).toHaveProperty('name', 'Jon');
          expect(student).toHaveProperty('grade', 4);
          expect(student).not.toHaveProperty('age');
        },
      },
      grant: {
        fields: [
          '*',
          {
            test: ['grade<9'],
            glob: 'age',
            negate: true,
          },
        ],
      },
    },
    {
      body: {},
      expected: {
        status: 403,
      },
      grant: {
        fields: null,
      },
    },
    {
      body: {},
      expected: {
        status: 403,
      },
      grant: {
        fields: ['friends'],
      },
    },
    {
      body: {
        name: 'Jon',
        grade: 4,
        age: 11,
      },
      expected: {
        status: 201,
      },
      grant: {
        fields: ['*'],
        documentConditions: ['grade=4'],
      },
    },
  ])(
    'TOP-LEVEL CREATE operations',
    async ({
      body = {},
      expected: { status, assertResponse },
      grant,
    }) => {
      setDeveloperPermissionOnStudents({
        ...grant,
        op: 'Create',
      });

      // allows us to ensure the create rules redacted body
      setDeveloperPermissionOnStudents({
        fields: ['*'],
        op: 'Read',
        ownership: 'Any',
      });

      const response = await agent
        .post(`/${coll}`)
        .send(body)
        .set({ Authorization })
        .expect(status);

      if (isFunction(assertResponse))
        await assertResponse(
          get(response, 'body.student', {}),
        );
    },
  );

  test.each([
    {
      body: {
        test: 'Foo',
        message: 'Ignore',
      },
      expected: {
        status: 201,
        assertResponse: (friend) => {
          expect(friend).toHaveProperty('test', 'Foo');
          expect(friend).not.toHaveProperty('message');
        },
      },
      grant: {
        fields: ['!samples.message'],
        ownership: 'Any',
      },
    },
    {
      body: {
        test: 'Foo',
        message: 'Ignore',
      },
      expected: {
        status: 201,
        assertResponse: (friend) => {
          expect(friend).toEqual(expect.any(Object));
        },
      },
      grant: {
        fields: [
          '{foo}',
          {
            glob: 'samples',
            wildcard: true,
            test: ['name=Test'],
          },
        ],
        ownership: 'Any',
      },
    },
    {
      body: {
        test: 'Foo',
        message: 'Ignore',
      },
      expected: {
        status: 403,
      },
      grant: {
        fields: [
          '*',
          {
            glob: 'samples',
            wildcard: true,
            negate: true,
            test: ['name=Test'],
          },
        ],
        ownership: 'Any',
      },
    },
    {
      body: {},
      expected: {
        status: 403,
      },
      grant: {
        fields: ['uploads*'],
        ownership: 'Any',
      },
    },
  ])(
    'SUB-DOCUMENT CREATE operations',
    async ({
      body = {},
      expected: { status, assertResponse },
      grant,
    }) => {
      setDeveloperPermissionOnStudents({
        ...grant,
        op: 'Create',
      });

      // allows us to ensure the create rules redacted body
      setDeveloperPermissionOnStudents({
        fields: ['*'],
        op: 'Read',
        ownership: 'Any',
      });

      const student = await Q3.model('students').create({
        name: 'Test',
        active: true,
      });

      const response = await agent
        .post(`/${coll}/${student._id}/samples`)
        .send(body)
        .set({ Authorization })
        .expect(status);

      if (isFunction(assertResponse))
        await assertResponse(
          first(get(response, 'body.samples')),
        );
    },
  );

  test.each([
    {
      body: {
        test: 'Quuz',
      },
      expected: {
        status: 200,
        assertResponse: (sample) => {
          expect(sample).toHaveProperty('test', 'Quuz');
        },
      },
      grant: {
        fields: ['*'],
      },
    },
    {
      body: {
        test: 'Quuz',
      },
      expected: {
        status: 403,
      },
      grant: {
        fields: [
          '*',
          {
            glob: 'samples',
            wildcard: true,
            negate: true,
            unwind: 'samples',
            test: ['samples.test=Foo'],
          },
        ],
      },
    },
    {
      body: {
        test: 'Quuz',
      },
      expected: {
        status: 403,
      },
      grant: {
        fields: ['name'],
      },
    },
    {
      body: {
        test: 'Quuz',
        message: 'Quuz',
      },
      expected: {
        status: 200,
        assertResponse: (sample) => {
          expect(sample).toHaveProperty('test', 'Foo');
          expect(sample).toHaveProperty('message', 'Quuz');
          expect(sample.createdAt).toBeUndefined();
        },
      },
      grant: {
        fields: ['!samples.*.test'],
      },
    },
  ])(
    'SUB-DOCUMENT UPDATE operations',
    async ({
      body = {},
      expected: { status, assertResponse },
      grant,
    }) => {
      setDeveloperPermissionOnStudents({
        ...grant,
        op: 'Update',
      });

      // allows us to ensure the create rules redacted body
      setDeveloperPermissionOnStudents({
        fields: [
          '!samples.*.createdAt',
          '!samples.*.updatedAt',
        ],
        op: 'Read',
        ownership: 'Any',
      });

      const {
        id,
        samples: [{ _id: sampleId }],
      } = await Q3.model('students').create({
        name: 'Test',
        active: true,
        samples: [
          {
            test: 'Foo',
            message: 'Bar',
          },
        ],
      });

      const response = await agent
        .patch(makeApiPath(id, 'samples', sampleId))
        .send(body)
        .set({ Authorization })
        .expect(status);

      if (isFunction(assertResponse))
        await assertResponse(
          first(get(response, 'body.samples')),
        );
    },
  );

  test.each([
    {
      expected: {
        status: 200,
        assertResponse: (samples) => {
          expect(samples).toHaveLength(2);
          samples.every(
            (item) =>
              !isUndefined(item.message) &&
              isUndefined(item.test),
          );
        },
      },
      grant: {
        fields: ['!samples.test'],
      },
    },
    {
      expected: {
        status: 403,
      },
      grant: {
        fields: ['!samples*'],
      },
    },
    {
      expected: {
        status: 200,
        assertResponse: (samples) => {
          expect(samples).toHaveLength(1);
        },
      },
      grant: {
        fields: [
          '*',
          {
            glob: 'samples.*.',
            test: ['samples.message=Bar'],
            negate: true,
            wildcard: true,
            unwind: 'samples',
          },
        ],
      },
    },
    {
      expected: {
        status: 200,
        assertResponse: (samples) => {
          expect(samples).toHaveLength(2);
          samples.every(
            (item) =>
              !isUndefined(item.message) &&
              !isUndefined(item.test),
          );
        },
      },
      grant: {
        fields: ['*'],
      },
    },
    {
      expected: {
        status: 200,
        assertResponse: (samples) => {
          expect(samples).toHaveLength(2);
        },
      },
      grant: {
        fields: ['*'],
      },
    },
  ])(
    'SUB-DOCUMENT GET operations',
    async ({
      expected: { status, assertResponse },
      grant,
    }) => {
      setDeveloperPermissionOnStudents({
        op: 'Read',
        ...grant,
      });

      const { id } = await Q3.model('students').create({
        name: 'Test',
        active: true,
        samples: [
          {
            test: 'Foo',
            message: 'Bar',
          },
          {
            test: 'Quuz',
            message: 'Thunk',
          },
        ],
      });

      const response = await agent
        .get(makeApiPath(id, 'samples'))
        .set({ Authorization })
        .expect(status);

      if (isFunction(assertResponse))
        await assertResponse(get(response, 'body.samples'));
    },
  );

  test.each([
    {
      expected: {
        status: 200,
        assertResponse: (sample) => {
          expect(sample).toMatchObject({
            name: expect.any(String),
            socialStatus: expect.any(String),
            active: expect.any(Boolean),
            grade: expect.any(Number),
            age: expect.any(Number),
            trigger: expect.any(Boolean),
            date: expect.any(String),
          });
        },
      },
      grant: {
        fields: ['*'],
      },
    },
    {
      expected: {
        status: 200,
        assertResponse: (sample) => {
          expect(sample).toMatchObject({
            name: expect.any(String),
            grade: expect.any(Number),
          });

          expect(sample).not.toHaveProperty('date');
          expect(sample).not.toHaveProperty('socialStatus');
        },
      },
      grant: {
        fields: [
          'name',
          '!socialStatus',
          {
            glob: 'date',
            negate: true,
            test: ['grade=12'],
          },
          {
            glob: 'grade',
            test: ['age>19'],
          },
        ],
      },
    },
    {
      expected: {
        status: 200,
        assertResponse: (sample) => {
          expect(sample).not.toHaveProperty('name');
        },
      },
      grant: {
        fields: [
          '*',
          {
            glob: 'name',
            negate: true,
            test: [`q3.session.user.email=${email}`],
          },
        ],
      },
    },
    {
      expected: {
        status: 404,
      },
      grant: {
        fields: ['*'],
        documentConditions: ['name=Real'],
      },
    },
  ])(
    'GET operations',
    async ({
      expected: { status, assertResponse },
      grant,
    }) => {
      setDeveloperPermissionOnStudents({
        ...grant,
        op: 'Read',
      });

      const { id } = await Q3.model('students').create({
        name: 'Test',
        active: true,
        grade: 12,
        age: 22,
        trigger: false,
        date: new Date(),
        samples: [
          {
            test: 'Foo',
            message: 'Bar',
          },
        ],
      });

      const response = await agent
        .get(makeApiPath(id))
        .set({ Authorization })
        .expect(status);

      if (isFunction(assertResponse))
        await assertResponse(get(response, 'body.student'));
    },
  );

  describe('ownership', () => {
    it('should return only documents the user creates', async () => {
      setDeveloperPermissionOnStudents({
        fields: ['*'],
        op: 'Create',
      });

      setDeveloperPermissionOnStudents({
        fields: ['*'],
        op: 'Read',
        ownership: 'Own',
      });

      await Students.create({
        name: 'Hidden',
      });

      await agent
        .post(makeApiPath())
        .set({ Authorization })
        .send({ name: 'Foo' })
        .expect(201);

      const { body } = await agent
        .get(makeApiPath())
        .set({ Authorization })
        .expect(200);

      expect(body).toHaveProperty('total', 1);
      expect(first(body.students)).toHaveProperty(
        'name',
        'Foo',
      );
    });

    it("should block updating another user's document", async () => {
      setDeveloperPermissionOnStudents({
        fields: ['*'],
        op: 'Update',
        ownership: 'Own',
      });

      setDeveloperPermissionOnStudents({
        fields: ['*'],
        op: 'Read',
        ownership: 'All',
      });

      return agent
        .patch(
          makeApiPath(
            get(
              await Students.create({
                name: 'Blocked',
              }),
              '_id',
            ),
          ),
        )
        .set({ Authorization })
        .send({ name: 'Foo' })
        .expect(403);
    });
  });

  describe('bulk', () => {
    it('should skip documents', async () => {
      setDeveloperPermissionOnStudents({
        fields: ['*'],
        op: 'Create',
      });

      setDeveloperPermissionOnStudents({
        fields: [
          '*',
          {
            glob: 'samples.*.test',
            negate: true,
            unwind: 'samples',
            test: ['samples.message=Foo'],
          },
        ],
        op: 'Update',
        ownership: 'Own',
      });

      const studentId = get(
        await agent
          .post(makeApiPath())
          .set({ Authorization })
          .expect(201),
        'body.student.id',
      );

      const getSampleId = async (message) =>
        get(
          last(
            get(
              await agent
                .post(makeApiPath(studentId, 'samples'))
                .set({ Authorization })
                .send({
                  message,
                  test: message,
                })
                .expect(201),
              'body.samples',
            ),
          ),
          'id',
        );

      const {
        body: { samples },
      } = await agent
        .patch(makeApiPath(studentId, 'samples'))
        .query({
          ids: [
            await getSampleId('Foo'),
            await getSampleId('Bar'),
          ],
        })
        .set({ Authorization })
        .send({
          test: 'Quuz',
        })
        .expect(200);

      expect(first(samples)).toHaveProperty('test', 'Foo');
      expect(last(samples)).toHaveProperty('test', 'Quuz');
    });

    it('should skip documents', async () => {
      setDeveloperPermissionOnStudents({
        fields: ['*'],
        op: 'Read',
      });

      setDeveloperPermissionOnStudents({
        fields: ['*'],
        op: 'Create',
      });

      setDeveloperPermissionOnStudents({
        fields: [
          '*',
          {
            glob: 'samples.*.',
            negate: true,
            wildcard: true,
            unwind: 'samples',
            test: ['samples.message=Foo'],
          },
        ],
        op: 'Delete',
        ownership: 'Own',
      });

      const studentId = get(
        await agent
          .post(makeApiPath())
          .set({ Authorization })
          .expect(201),
        'body.student.id',
      );

      const getSampleId = async (message) =>
        get(
          last(
            get(
              await agent
                .post(makeApiPath(studentId, 'samples'))
                .set({ Authorization })
                .send({
                  message,
                  test: message,
                })
                .expect(201),
              'body.samples',
            ),
          ),
          'id',
        );

      await agent
        .delete(makeApiPath(studentId, 'samples'))
        .query({
          ids: [
            await getSampleId('Foo'),
            await getSampleId('Bar'),
          ],
        })
        .set({ Authorization })
        .expect(204);

      const {
        body: { samples },
      } = await agent
        .get(makeApiPath(studentId, 'samples'))
        .set({ Authorization })
        .expect(200);

      expect(samples).toHaveLength(1);
    });

    it('should require read permission', async () => {
      setDeveloperPermissionOnStudents({
        op: 'Read',
        fields: null,
      });

      const { _id: id } = await Students.create({
        name: 'Hidden',
      });

      await agent
        .get('/students')
        .set({ Authorization })
        .expect(403);

      await agent
        .get(`/students/${id}`)
        .set({ Authorization })
        .expect(403);

      await agent
        .get(`/students/${id}/samples`)
        .set({ Authorization })
        .expect(403);
    });

    it('should convert ownership query', async () => {
      setDeveloperPermissionOnStudents({
        op: 'Update',
        fields: ['*'],
        ownership: 'Own',
        ownershipAliases: [
          {
            foreign: 'email',
            local: 'name',
          },
        ],
        ownershipAliasesOnly: true,
      });

      const { _id: id } = await Students.create({
        name: email,
      });

      await agent
        .patch(`/students/${id}`)
        .send({ name: 'New' })
        .set({ Authorization })
        .expect(200);
    });

    it('should convert ownership object ids', async () => {
      setDeveloperPermissionOnStudents({
        op: 'Update',
        fields: ['*'],
        ownership: 'Own',
        ownershipAliases: [
          {
            foreign: '_id',
            local: 'referenceId',
            cast: 'ObjectId',
          },
        ],
        ownershipAliasesOnly: true,
      });

      const { _id: id } = await Students.create({
        name: email,
        referenceId: userSessionId,
      });

      await agent
        .patch(`/students/${id}`)
        .send({ name: 'New' })
        .set({ Authorization })
        .expect(200);
    });
  });

  describe('misc', () => {
    it('should replace simple sub-document', async () => {
      setDeveloperPermissionOnStudents({
        op: 'Update',
        fields: ['*'],
        ownership: 'Any',
      });

      setDeveloperPermissionOnStudents({
        op: 'Read',
        fields: ['dimensions.{weight,height,id}'],
        ownership: 'Any',
      });

      const { _id: id } = await Students.create({
        name: email,
      });

      const args = {
        weight: 200,
        height: 11,
      };

      const { body } = await agent
        .put(`/students/${id}/dimensions`)
        .send(args)
        .set({ Authorization })
        .expect(201);

      expect(body.dimensions).toEqual({
        id: expect.any(String),
        ...args,
      });
    });

    it('should recommend PUT', async () => {
      setDeveloperPermissionOnStudents({
        op: 'Update',
        fields: ['*'],
        ownership: 'Any',
      });

      const { _id: id } = await Students.create({
        name: 'Testing',
      });

      await agent
        .patch(`/students/${id}/dimensions`)
        .send({})
        .set({ Authorization })
        .expect(409);
    });
  });
});
