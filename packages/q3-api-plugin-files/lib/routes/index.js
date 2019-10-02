const { Router } = require('express');

const app = Router();
app.use(require('./middleware'));

app
  .route('/files')
  .get(require('./list'))
  .post(require('./upload'));

app
  .route('/files/:fileID')
  .get(require('./download'))
  .delete(require('./delete'));

module.exports = app;
