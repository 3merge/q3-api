const { invoke } = require('lodash');

const debounceCollect = (fn, interval = 250) => {
  const handlers = {};
  let busy = false;
  let store = [];

  async function Debouncer(args) {
    store.push(args);

    if (!busy) {
      busy = true;
      setTimeout(async () => {
        try {
          await invoke(
            handlers,
            'handleData',
            await fn(store),
          );
        } catch (e) {
          await invoke(handlers, 'handleError', e);
        }

        store = [];
        busy = false;
      }, interval);
    }
  }

  Debouncer.on = (evt, callback) => {
    const method = {
      data: 'handleData',
      error: 'handleError',
    }[evt];

    if (method)
      Object.assign(handlers, {
        [method]: callback,
      });
  };

  return Debouncer;
};

module.exports = debounceCollect;
