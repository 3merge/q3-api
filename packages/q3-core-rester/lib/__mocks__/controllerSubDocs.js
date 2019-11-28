/* eslint-disable class-methods-use-this */
const Router = require('express');

const exec = jest.fn();
class RestDocument {
  exec() {
    exec();
    return Router();
  }
}

RestDocument.exec = exec;
module.exports = RestDocument;
