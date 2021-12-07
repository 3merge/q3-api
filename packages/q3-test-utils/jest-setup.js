require('q3-schema-types');

global.wait = (callback) =>
  new Promise((r) =>
    // eslint-disable-next-line
    setTimeout(async () => {
      await callback();
      r();
    }, 50),
  );
