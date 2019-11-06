const { middleware } = require('q3-core-responder');
const app = require('../config/express');

app.use(middleware);
app.use(require('./decorators'));
app.use(require('./authentication'));
app.use(require('./authorization'));
