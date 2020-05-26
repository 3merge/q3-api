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
});
