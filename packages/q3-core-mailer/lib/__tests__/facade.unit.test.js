const Core = require('../core');
const Facade = require('../facade');

const fromFn = jest
  .spyOn(Core.prototype, 'fromDatabase')
  .mockReturnValue(null);

const sendFn = jest
  .spyOn(Core.prototype, 'send')
  .mockReturnValue(null);

describe('Facade', () => {
  it('should invoke Core with template variables', async () => {
    process.env.WEB_APP = 'https://google.ca';
    const context = {
      context: {
        foo: 1,
      },
    };

    const user = {
      email: 'developer@test.ca',
      lang: 'en',
      tenant: 'hooli',
    };

    await Facade(user, context, 'onCustomerListener');
    expect(fromFn).toHaveBeenCalledWith({
      context: context.context,
      url: 'https://hooli.google.ca',
      user,
    });

    expect(sendFn).toHaveBeenCalled();
  });

  it('should report back this filename', () => {
    expect(Facade.interpretTemplateName()).toEqual(
      'facade',
    );
  });
});
