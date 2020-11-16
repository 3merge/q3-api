const resolvers = require('@3merge/app-resolvers');
const { capitalize } = require('lodash');
const { schemaComposer } = require('graphql-compose');
const {
  CREATE,
  GET,
  LIST,
  REMOVE,
  UPDATE,
  MUTATION,
  QUERY,
  getOp,
  mapConstantsToQueryValue,
} = require('./constants');
const {
  getCollectionInputName,
  getUpdateArguments,
} = require('./helpers');

module.exports = (datasource) => {
  const coll = datasource?.collection?.collectionName;

  const makeResolver = (methodName) => async ({ args }) => {
    const { id, limit, page, filter = {} } = args;
    const query = Object.entries(filter).reduce(
      (acc, [field, value]) => {
        const [key, op] = getOp(field);
        acc[key] = mapConstantsToQueryValue(op, value);
        return acc;
      },
      {},
    );

    return resolvers[methodName]({
      collectionPluralName: coll,
      datasource,
      params: {
        resourceID: id,
      },
      query,
      limit,
      page,
    });
  };

  class ResolverFactory {
    constructor(type, schema = {}) {
      this.__$inputType = getCollectionInputName(coll);
      this.__$schema = schema;
      this.__$type = type;
    }

    static of(...args) {
      return new ResolverFactory(...args);
    }

    static isGetter(key) {
      return Object.getOwnPropertyDescriptor(
        ResolverFactory.prototype,
        key,
      )?.get;
    }

    static getGetters() {
      return Object.getOwnPropertyNames(
        ResolverFactory.prototype,
      ).filter(ResolverFactory.isGetter);
    }

    get create() {
      return this.withType({
        args: getUpdateArguments(this.__$schema, {
          disableRequirements: false,
        }),
        kind: MUTATION,
        name: CREATE,
      });
    }

    get get() {
      return this.withType({
        kind: QUERY,
        name: GET,
        args: {
          id: {
            type: 'String!',
          },
        },
      });
    }

    get list() {
      return {
        type: this.makeListType(),
        kind: QUERY,
        name: LIST,
        args: {
          filter: this.makeFilterName(),
          limit: {
            type: 'Int',
            defaultValue: 20,
          },
          page: {
            type: 'Int',
            defaultValue: 0,
          },
          sort: {
            type: 'String',
            defaultValue: 'createdAt',
          },
        },
      };
    }

    get patch() {
      return this.withType({
        args: {
          ...getUpdateArguments(this.__$schema, {
            disableRequirements: true,
          }),
          id: {
            type: 'String!',
          },
        },
        kind: MUTATION,
        name: UPDATE,
      });
    }

    get remove() {
      return this.withType({
        kind: MUTATION,
        name: REMOVE,
        args: {
          id: {
            type: 'String!',
          },
        },
      });
    }

    build() {
      return ResolverFactory.getGetters().map((curr) => ({
        ...this[curr],
        resolve: makeResolver(capitalize(curr)),
      }));
    }

    makeFilterName() {
      return `Filter${this.__$inputType}Input`;
    }

    makeListType() {
      return schemaComposer.createObjectTC(
        `type List${this.__$inputType}{
          data: [${this.__$inputType}]
          total: Float
          hasNextPage: Float
          hasPrevPage: Float
        }`,
      );
    }

    withType(params = {}) {
      return {
        ...params,
        type: this.__$type,
      };
    }
  }

  return ResolverFactory.of;
};
