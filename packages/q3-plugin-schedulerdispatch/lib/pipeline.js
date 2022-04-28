const session = require('q3-core-session');

module.exports = async (
  collectionSource,
  notificationName,
  additionalUserQuery = {},
) => {
  const tnt = session.get('TENANT');

  return collectionSource.aggregate([
    {
      '$match': {
        'tenant': tnt,
      },
    },
    {
      '$project': {
        '_id': 0,
        'listens': {
          '$objectToArray': '$listens',
        },
      },
    },
    {
      '$unwind': {
        'path': '$listens',
      },
    },
    {
      '$match': {
        'listens.v': notificationName,
      },
    },
    {
      '$group': {
        '_id': 0,
        'roles': {
          '$push': '$listens.k',
        },
      },
    },
    {
      '$project': {
        '_id': 0,
        'roles': 1,
      },
    },
    {
      '$lookup': {
        'from': 'users',
        'let': {
          'role': '$roles',
        },
        'pipeline': [
          {
            '$match': {
              ...additionalUserQuery,
              'listens': notificationName,
              'active': true,
              'verified': true,
              'tenant': tnt,
              '$expr': {
                '$in': ['$role', '$$role'],
              },
            },
          },
        ],
        'as': 'users',
      },
    },
    {
      '$unwind': {
        'path': '$users',
      },
    },
    {
      '$project': {
        '_id': '$users._id',
        'email': '$users.email',
        'firstName': '$users.firstName',
        'lastName': '$users.lastName',
        'lang': '$users.lang',
        'locale': '$users.timezone',
        'timezone': '$users.timezone',
        'role': '$users.role',
        'tenant': '$users.tenant',
      },
    },
  ]);
};
