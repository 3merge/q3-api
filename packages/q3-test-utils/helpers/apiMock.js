// eslint-disable-next-line
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
      evoke: jest.fn(),
      get: jest.fn(),
      t: jest.fn().mockImplementation((v) => v),
      rerunRedactOnRequestBody: jest.fn(),
      marshal: jest.fn().mockImplementation((v) => v),
      isFresh: jest.fn(),
      user,
    };

    this.res = {
      ok: jest.fn(),
      acknowledge: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      csv: jest.fn(),
      say: jest.fn(),
    };
  }

  reset() {
    this.setup(this.init);
  }

  inject(req = {}, res = {}) {
    merge(this.req, req);
    merge(this.res, res);
  }
};
