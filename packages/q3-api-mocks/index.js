const { merge } = require('lodash');
const mongoose = require('mongoose');

module.exports = class ControllerMock {
  constructor(args = {}) {
    this.req = {};
    this.res = {};
    this.setup(args);
    this.init = args;
  }

  superSession() {
    this.req.user = {
      user: {
        id: mongoose.Types.ObjectId(),
        role: 'Super',
      },
    };
  }

  setup({ body, params, query, user }) {
    this.req = {
      body: { ...body },
      params: { ...params },
      query: { ...query },
      t: jest.fn(),
      user,
    };

    this.res = {
      ok: jest.fn(),
      acknowledge: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };
  }

  clear() {
    this.req.t.mockReset();
    this.res.ok.mockReset();
    this.res.acknowledge.mockReset();
    this.res.update.mockReset();
    this.res.create.mockReset();
  }

  reset() {
    this.setup(this.init);
  }

  inject(req, res) {
    merge(this.req, req);
    merge(this.res, res);
  }
};
