const app = require('../config/express');

app.use(require('./decorators'));
app.use(require('./internationalization'));
app.use(require('./authentication'));
app.use(require('./authorization'));
