const cluster = require('cluster');
const os = require('os');

const {
  DEBUG_CONTROLLER: verbose,
  NODE_ENV: env,
  PORT: port,
  PURPOSE: purpose,
  WEB_CONCURRENCY: concurrent,
} = process.env;

const concurrencySetting = concurrent || os.cpus().length;

const isTestEnvironment = env === 'test';

const isMasterEnvironment =
  cluster.isMaster &&
  !isTestEnvironment &&
  purpose !== 'queue';

const isWorkerEnvironment =
  !isTestEnvironment && cluster.isWorker;

if (isMasterEnvironment) {
  if (verbose)
    // eslint-disable-next-line
    console.log(
      `Running ${concurrencySetting} cluster(s) on port ${port}`,
    );

  for (let i = 0; i < concurrencySetting; i += 1)
    cluster.fork();

  cluster.on('exit', () => {
    cluster.fork();
  });
}

module.exports = {
  concurrencySetting,
  isMasterEnvironment,
  isWorkerEnvironment,
};
