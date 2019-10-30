const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const limit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const contextService = require('request-context');
require('csv-express');

const server = express();

server.enable('trust proxy');
server.use(helmet());
server.use(cors());
server.use(compression());
server.use(bodyParser.json());
server.use(contextService.middleware('q3-session'));

server.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    // useTempFiles: true,
    // tempFileDir: '/tmp/',
  }),
);

server.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

server.use(
  limit({
    windowMs: 15 * 60 * 1000,
    max: 500,
  }),
);

module.exports = server;
