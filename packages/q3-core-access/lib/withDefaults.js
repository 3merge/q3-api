const { map, uniq } = require('lodash');

const defaultAccessControlSettings = [
  {
    'op': 'Read',
    'coll': 'notifications',
    'fields': ['*'],
    'ownership': 'Own',
    'ownershipAliasesOnly': true,
    'ownershipAliases': [
      {
        'local': 'userId',
        'foreign': '_id',
        'cast': 'ObjectId',
      },
    ],
  },
  {
    'op': 'Delete',
    'coll': 'notifications',
    'fields': ['*'],
    'ownership': 'Own',
    'ownershipAliasesOnly': true,
    'ownershipAliases': [
      {
        'local': 'userId',
        'foreign': '_id',
        'cast': 'ObjectId',
      },
    ],
  },
  {
    'op': 'Update',
    'coll': 'notifications',
    'fields': ['{read,archived}'],
    'ownership': 'Own',
    'ownershipAliasesOnly': true,
    'ownershipAliases': [
      {
        'local': 'userId',
        'foreign': '_id',
        'cast': 'ObjectId',
      },
    ],
  },
  {
    'op': 'Read',
    'fields': [
      '!source',
      '!apiKeys*',
      '!password',
      '!loginAttempts',
      '!passwordResetTokenIssuedOn',
      '!passwordResetToken',
      '!secretIssuedOn',
      '!secret',
    ],
    'coll': 'profile',
    'inClient': true,
  },
  {
    'op': 'Create',
    'fields': [
      '!source',
      '!apiKeys*',
      '!password',
      '!loginAttempts',
      '!passwordResetTokenIssuedOn',
      '!passwordResetToken',
      '!secretIssuedOn',
      '!secret',
    ],
    'coll': 'profile',
  },
  {
    'op': 'Update',
    'fields': [
      '!source',
      '!apiKeys*',
      '!password',
      '!loginAttempts',
      '!passwordResetTokenIssuedOn',
      '!passwordResetToken',
      '!secretIssuedOn',
      '!secret',
    ],
    'coll': 'profile',
    'ownership': 'Any',
  },
  {
    'op': 'Delete',
    'fields': ['featuredUpload'],
    'coll': 'profile',
    'ownership': 'Any',
  },
];

module.exports = (grants = []) => {
  if (!Array.isArray(grants))
    return defaultAccessControlSettings;

  const isSame = (a, b) =>
    a.op === b.op && a.coll === b.coll && a.role === b.role;

  const output = uniq(map(grants, 'role'))
    .map((role) =>
      defaultAccessControlSettings.map((item) => ({
        ...item,
        role,
      })),
    )
    .flat()
    .reduce((acc, curr) => {
      const match = grants.find((grant) =>
        isSame(grant, curr),
      );

      if (match) acc.push(match);
      else acc.push(curr);
      return acc;
    }, []);

  const leftover = grants.filter((item) => {
    const match = output.find((grant) =>
      isSame(grant, item),
    );

    return !match;
  });

  return [...output, ...leftover];
};
