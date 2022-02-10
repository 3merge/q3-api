jest.mock('q3-core-session', () => ({
  get: jest.fn().mockReturnValue('en'),
}));

jest.mock('i18next', () => ({
  getFixedT: jest.fn(),
}));

const i18next = require('i18next');
const { labels } = require('../translate');

describe('translate.labels', () => {
  it('should return without namespace', () => {
    i18next.getFixedT.mockReturnValue(
      jest.fn().mockReturnValue('labels:testing'),
    );

    expect(labels('testing')).toEqual('testing');
  });

  it('should return cleanly', () => {
    i18next.getFixedT.mockReturnValue(
      jest.fn().mockReturnValue('testing'),
    );

    expect(labels('testing')).toEqual('testing');
  });

  it('should return empty', () => {
    i18next.getFixedT.mockReturnValue(
      jest.fn().mockReturnValue(null),
    );

    expect(labels('testing')).toEqual('');
  });
});
