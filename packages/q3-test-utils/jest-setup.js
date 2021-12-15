require('q3-schema-types');

global.wait = (callback, interval = 100) =>
  new Promise((r) =>
    // eslint-disable-next-line
    setTimeout(async () => {
      await callback();
      r();
    }, interval),
  );
