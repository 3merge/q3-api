jest.mock('q3-schema-utils', () => ({
  executeOnAsync: jest.fn(),
}));

const { executeOnAsync } = require('q3-schema-utils');
const ModelHelpers = require('q3-test-utils/helpers/modelMock');
const Schema = require('../schema');

beforeEach(() => {
  ModelHelpers.reset();
});

describe('Scheduler Schema', () => {
  it('should run fn on each task found', async () => {
    ModelHelpers.exec.mockReturnValue([]);
    await Schema.statics.registerTasks.call(ModelHelpers);

    expect(executeOnAsync).toHaveBeenCalledWith(
      [],
      expect.any(Function),
    );
  });

  it('should run only if not already running', async () => {
    await Schema.methods.run.call({
      running: false,
      ...ModelHelpers,
    });

    expect(ModelHelpers.set).toHaveBeenCalledWith({
      running: true,
    });
  });

  it('should not run an already running task', async () => {
    await Schema.methods.run.call({
      running: true,
      ...ModelHelpers,
    });

    expect(ModelHelpers.set).not.toHaveBeenCalled();
  });
});
