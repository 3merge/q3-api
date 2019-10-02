import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import limit from 'express-rate-limit';
import fileUpload from 'express-fileupload';

const server = express();

server.enable('trust proxy');
server.use(helmet());
server.use(cors());
server.use(compression());
server.use(bodyParser.json());

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
  limit({
    windowMs: 15 * 60 * 1000,
    max: 500,
  }),
);

export default server;
