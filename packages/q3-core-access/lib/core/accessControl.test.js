const AccessControl = require('./accessControl');

describe('AccessControl', () => {
  it('should initialize grants', () => {
    AccessControl.init([
      {
        coll: 'foo',
        role: 'Admin',
        op: 'Read',
      },
    ]);

    const { grants } = AccessControl;

    expect(grants).toHaveLength(1);
    expect(grants[0]).toMatchObject({
      ownership: 'Own',
      fields: '*',
    });
  });

  it('should get by role type', () => {
    expect(AccessControl.get('Admin')).toHaveLength(1);
  });
});
