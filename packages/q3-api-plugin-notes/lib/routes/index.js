const { Router } = require('express');

const app = Router();

app
  .route('/notes')
  .get(require('./list'))
  .post(require('./create'));

app
  .route('/notes/:noteID')
  .put(require('./addToThread'))
  .delete(require('./delete'));

app
  .route('/notes/:noteID/:threadID')
  .get(require('./get'))
  .patch(require('./update'))
  .delete(require('./removeFromThread'));

/*
app
  .route('/notes/:noteID')
  .get(require('./get'))
  .patch(require('./update'))
  .delete(require('./delete'));

app
  .route('/notes/:noteID/subscribe')
  .post(require('./subscribe'))
  .delete(require('./unsubscribe'));
  */

module.exports = app;
