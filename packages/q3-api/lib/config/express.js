const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const limit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const useragent = require('express-useragent');
const session = require('q3-core-session');
const corsConfig = require('./express-cors');

const server = express();

server.all(session.middleware);

server.enable('trust proxy');
server.use(helmet());

// relies on app.locals to run
server.use(cors(corsConfig(server)));
server.use(compression());
server.use(bodyParser.json());
server.use(useragent.express());

server.use(
  fileUpload({
    limits: {
      fileSize:
        process.env.Q3_MAX_FILE_SIZE || 50 * 1024 * 1024,
    },
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
      windowMs: 300000,
      max: 1000,
    }),
  );

module.exports = server;
