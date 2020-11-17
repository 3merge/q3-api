const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const limit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const useragent = require('express-useragent');
const session = require('q3-core-session');
const i18next = require('i18next');
const middleware = require('i18next-http-middleware');
const corsConfig = require('./express-cors');

const server = express();

server.all(session.middleware);

server.enable('trust proxy');
server.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === 'production'
        ? undefined
        : false,
  }),
);

// relies on app.locals to run
server.use(cors(corsConfig(server)));
server.use(compression());
server.use(bodyParser.json());
server.use(useragent.express());

server.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  }),
);

server.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

server.use(
  middleware.handle(i18next, {
    removeLngFromUrl: false,
  }),
);

if (process.env.NODE_ENV !== 'test')
  server.use(
    limit({
      windowMs: 15 * 60 * 1000,
      max: 500,
    }),
  );

module.exports = server;
