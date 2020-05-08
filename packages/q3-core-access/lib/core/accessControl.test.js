const AccessControl = require('./accessControl');

describe('AccessControl', () => {
  it('should initialize grants', () => {
    const grants = AccessControl.init([
      {
        coll: 'foo',
        role: 'Admin',
        op: 'Read',
      },
    ]);

    expect(grants).toHaveLength(1);
    expect(grants[0]).toMatchObject({
      ownership: 'Any',
      fields: '*',
    });

    expect(() =>
      grants.push({
        foo: 1,
      }),
    ).toThrowError();
  });

  it('should get by role type', () => {
    expect(
      AccessControl.getByRoleType('Admin'),
    ).toHaveLength(1);
  });
});
