const controllerFacade = require('..');
const Controller = require('../root');
const SubController = require('../sub');

jest.mock('../root');
jest.mock('../sub');

describe('Controller facade', () => {
  it('should throw an error without an app and Model', () => {
    expect(() => controllerFacade()()).toThrowError();
  });

  it.skip('should do nothing and print a warning', () => {
    const spy = jest.spyOn(global.console, 'warn');
    controllerFacade({})({
      collection: {
        collectionName: 'Foo',
      },
      schema: {
        get: jest.fn(),
      },
    });

    expect(spy).toHaveBeenCalled();
  });

  it('should register controllers and subcontrollers', () => {
    const use = jest.fn();
    controllerFacade({
      use,
    })({
      collection: {
        collectionName: 'Foo',
      },
      schema: {
        get: jest.fn().mockReturnValue(true),
        childSchemas: [
          { model: { path: 'bars' } },
          { model: { path: 'quux' } },
        ],
      },
    });

    expect(Controller).toHaveBeenCalled();
    expect(SubController).toHaveBeenCalled();
    expect(use.mock.calls).toHaveLength(3);
  });
});
