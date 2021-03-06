/* eslint-disable prefer-rest-params */
const { Router } = require('express');
const { compose } = require('q3-core-composer');
const ValidationBuilder = require('m2e-validator/lib/middlewareBuilder');
const { pick } = require('./utils');

const knownControllerVerbs = 'get patch put delete post';

module.exports = class RestRegistrationModule {
  constructor(Model, field) {
    if (!Model) throw new Error('Model is required');

    this.datasource = Model;
    this.restify = Model.schema.get('restify');
    this.field = field;

    this.app = Router();
    this.preRoute = [];
    this.addMiddleware();
    this.addOptions();
  }

  getValidationSchema(strict) {
    const inst = new ValidationBuilder(
      this.datasource.getSchemaPaths(strict),
    );
    return [inst.exec.bind(inst)];
  }

  getChildValidationSchema() {
    const inst = new ValidationBuilder(
      this.datasource.getChildPaths(this.field),
    );
    return [inst.exec.bind(inst)];
  }

  getSchemaOptions() {
    const { schema, collection } = this.datasource;
    const { collectionName } = collection;
    const opts = pick(schema.options, [
      'collectionPluralName',
      'collectionSingularName',
    ]);

    return {
      collectionName,
      ...opts,
    };
  }

  addMiddleware() {
    this.app.use((req, res, next) => {
      Object.assign(req, this.getSchemaOptions(), {
        datasource: this.datasource,
      });

      next();
    });
  }

  addOptions() {
    Object.assign(this, this.getSchemaOptions());
  }

  makeGet() {
    return this.$mkt('get', arguments);
  }

  makePost() {
    return this.$mkt('post', arguments);
  }

  makePut() {
    return this.$mkt('put', arguments);
  }

  makePatch() {
    return this.$mkt('patch', arguments);
  }

  makeDelete() {
    return this.$mkt('delete', arguments);
  }

  getPathName() {
    return `/${this.collectionName}`;
  }

  getResourcePathName() {
    return `${this.getPathName()}/:resourceID`;
  }

  getNestedPathName() {
    return `${this.getPathName()}/:resourceID/${
      this.field
    }`;
  }

  getNestedResourcePathName() {
    return `${this.getPathName()}/:resourceID/${
      this.field
    }/:fieldID`;
  }

  isRestEnabled(verb) {
    return (
      typeof this.restify === 'string' &&
      knownControllerVerbs.includes(verb) &&
      (this.restify.includes(verb) || this.restify === '*')
    );
  }

  $mkt(verb, args) {
    const [route, Controller] = args;
    const restReady = this.isRestEnabled(verb);
    Controller.postAuthorization = this.preRoute;

    return restReady
      ? this.app[verb](route, compose(Controller))
      : undefined;
  }
};
