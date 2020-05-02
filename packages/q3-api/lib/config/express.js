const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const limit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const useragent = require('express-useragent');
const session = require('q3-core-session');
require('csv-express');

const server = express();

server.all(session.middleware);

server.enable('trust proxy');
server.use(helmet());
server.use(cors());
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

if (process.env.NODE_ENV !== 'test')
  server.use(
    limit({
      windowMs: 15 * 60 * 1000,
      max: 500,
    }),
  );

module.exports = server;
