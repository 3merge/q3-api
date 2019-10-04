const { Router } = require('express');

const app = Router();

app
  .route('/permissions')
  .get(require('./get'))
  .post(require('./post'));

app
  .route('/permissions/:permissionID')
  .get(require('./get.id'))
  .patch(require('./patch.id'))
  .delete(require('./delete.id'));

module.exports = app;
