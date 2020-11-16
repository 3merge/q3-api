const DELIMITER_CHAR = '__';
const GREATER_THAN = 'gt';
const LESS_THAN = 'lt';
const GREATER_THAN_EQUALS = 'gte';
const LESS_THAN_EQUALS = 'lte';
const LIKE = 'like';
const EQUALS = 'eq';
const NOT_EQUALS = 'ne';
const CREATE = 'create';
const GET = 'get';
const LIST = 'list';
const REMOVE = 'remove';
const UPDATE = 'update';

exports.CRUD_MAP = {
  Mutation: [CREATE, REMOVE, UPDATE],
  Query: [GET, LIST],
};

exports.getOp = (field) =>
  typeof field === 'string'
    ? field.split(DELIMITER_CHAR)
    : [];

exports.makeOperationFieldNames = (f) =>
  [
    GREATER_THAN,
    LESS_THAN,
    GREATER_THAN_EQUALS,
    LESS_THAN_EQUALS,
    LIKE,
    EQUALS,
    NOT_EQUALS,
  ].map((op) => [f, DELIMITER_CHAR, op].join(''));

exports.mapConstantsToQueryValue = (op, value) => {
  switch (op) {
    case LIKE:
      return new RegExp(value, 'gi');
    case LESS_THAN_EQUALS:
      return {
        $lte: value,
      };
    case GREATER_THAN_EQUALS:
      return {
        $gte: value,
      };
    case NOT_EQUALS:
      return {
        $ne: value,
      };
    case EQUALS:
    default:
      return value;
  }
};

exports.DELIMITER_CHAR = DELIMITER_CHAR;
exports.CREATE = CREATE;
exports.GET = GET;
exports.LIST = LIST;
exports.REMOVE = REMOVE;
exports.UPDATE = UPDATE;
exports.GREATER_THAN = GREATER_THAN;
exports.LESS_THAN = LESS_THAN;
exports.GREATER_THAN_EQUALS = GREATER_THAN_EQUALS;
exports.LESS_THAN_EQUALS = LESS_THAN_EQUALS;
exports.LIKE = LIKE;
exports.EQUALS = EQUALS;
exports.NOT_EQUALS = NOT_EQUALS;

exports.MUTATION = 'mutation';
exports.QUERY = 'query';
