const Q3 = require('q3-api');
const {
  compact,
  first,
  get,
  isFunction,
} = require('lodash');
const setup = require('../fixtures');
const { access, teardown } = require('../helpers');

let agent;
let Authorization;

const role = 'Developer';
const coll = 'students';

const genStudentId = async () =>
  get(await Q3.model(coll).create({}), 'id');

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
  afterAll(teardown);

  beforeAll(async () => {
    ({ Authorization, agent } = await setup(
      'developer@3merge.ca',
      role,
    ));
  });

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
        },
      },
      grant: {
        fields: ['!samples.test'],
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
        fields: ['*'],
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

  test.only.each([
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
});
