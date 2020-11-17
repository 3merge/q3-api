const resolvers = require('@3merge/app-resolvers');
const { capitalize } = require('lodash');
const { schemaComposer } = require('graphql-compose');
const { exception } = require('q3-core-responder');
const { Grant, Redact } = require('q3-core-access');
const {
  CREATE,
  GET,
  LIST,
  REMOVE,
  UPDATE,
  MUTATION,
  QUERY,
} = require('./constants');
const {
  getCollectionInputName,
  getUpdateArguments,
  makeMongoQuery,
} = require('./helpers');

module.exports = (datasource) => {
  const coll = datasource?.collection?.collectionName;

  const makeResolver = (methodName) => async ({
    args,
    context,
  }) => {
    try {
      const { id, limit, page } = args;

      if (
        !new Grant(context.user)
          .can('Read')
          .on(coll)
          .first()
      )
        exception('Authorization').msg('GT-123').throw();

      args.__t = args.discriminatorKey;
      delete args.discriminatorKey;

      const r = await resolvers[methodName]({
        collectionPluralName: coll,
        query: makeMongoQuery(args),
        body: args,
        datasource,
        params: {
          resourceID: id,
        },
        limit,

        page,
      });

      const execRedaction = async (doc) => {
        const re = await Redact(doc, context.user, coll);
        re.discriminatorKey = args.__t;
        delete re.__t;
        return re;
      };

      return r.data
        ? {
            ...r,
            data: await Promise.all(
              r.data.map(execRedaction),
            ),
          }
        : execRedaction(r);
    } catch (e) {
      e.message = context.t(`messages:${e.message}`);
      throw e;
    }
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

    get post() {
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

    get delete() {
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
