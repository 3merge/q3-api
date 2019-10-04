const { exception, translate } = require('q3-api');
const { Router } = require('express');

const app = Router();

// use q3-api-plugin-users to avoid this error
// or create a custom auth flow
app.use((req, res, next) => {
  let err;
  if (!req.user)
    err = exception('AuthenticationError').boomerang(
      translate('messages:loginToPost'),
    );

  next(err);
});

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
