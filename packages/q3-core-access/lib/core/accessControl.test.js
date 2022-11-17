const AccessControl = require('./accessControl');

describe('AccessControl', () => {
  it('should initialize grants', () => {
    AccessControl.init([
      {
        coll: 'foo',
        role: 'Admin',
        op: 'Read',
      },
      {
        ownership: 'Any',
        fields: ['*'],
        coll: 'notifications',
        role: 'Admin',
        op: 'Update',
      },
    ]);

    const { grants } = AccessControl;

    expect(
      grants.find(
        (grant) =>
          grant.coll === 'notifications' &&
          grant.op === 'Update',
      ),
    ).toMatchObject({
      ownership: 'Any',
      fields: ['*'],
    });

    expect(
      grants.find(
        (grant) =>
          grant.coll === 'profile' && grant.op === 'Delete',
      ),
    ).toMatchObject({
      'op': 'Delete',
      'fields': ['featuredUpload'],
      'coll': 'profile',
      'ownership': 'Any',
    });

    expect(
      grants.find((grant) => grant.coll === 'foo'),
    ).toMatchObject({
      ownership: 'Own',
      fields: '*',
    });
  });

  it('should get by role type', () => {
    // inherits Notifications and Profile settings
    // 4 for Notifications and 3 for Profile
    // 1 custom
    expect(AccessControl.get('Admin')).toHaveLength(8);
  });
});
