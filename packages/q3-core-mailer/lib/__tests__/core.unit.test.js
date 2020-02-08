jest.mock('../strategies', () => jest.fn());

const Mailer = require('../core');
const strategies = require('../strategies');

let inst;

beforeEach(() => {
  inst = new Mailer('f');
});

describe('Mailer core', () => {
  describe('"to"', () => {
    it('should assign to field', () => {
      inst.to(['mibberson@3merge.ca']);
      expect(inst.meta).toHaveProperty('to');
    });

    it('should assign cc field', () => {
      inst.to(['mibberson@3merge.ca'], true);
      expect(inst.meta).toHaveProperty('cc');
    });

    it('should assign bcc field', () => {
      inst.to(['mibberson@3merge.ca'], false, true);
      expect(inst.meta).toHaveProperty('bcc');
    });

    it('should throw an error', () => {
      expect(() => inst.to()).toThrowError();
    });
  });

  describe('"subject"', () => {
    it('should assign subject field', () => {
      inst.subject('hey');
      expect(inst.meta).toHaveProperty('subject');
    });
  });

  describe('"props"', () => {
    it('should assign template variables', () => {
      inst.props({ foo: 1 });
      expect(inst.meta).toHaveProperty('v:foo');
    });
  });

  describe('"send"', () => {
    it('should call strategy', async () => {
      Mailer.config({
        strategy: 'Test',
      });

      await new Mailer('f').send();
      expect(strategies).toHaveBeenCalledWith(
        'Test',
        expect.any(Object),
      );
    });
  });
});
