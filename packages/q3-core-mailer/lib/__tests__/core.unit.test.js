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

  describe('"from"', () => {
    it('should assign reply-to', () => {
      inst.from('test@google.ca');
      expect(inst.meta).toHaveProperty('from');
    });
  });

  describe('"props"', () => {
    it('should assign template variables', () => {
      inst.props({ foo: 1 });
      expect(inst.meta).toHaveProperty(
        'h:X-Mailgun-Variables',
        expect.any(String),
      );
    });
  });

  describe('"lang"', () => {
    it('should default to en', async () => {
      expect(new Mailer('testing').lang).toMatch('en');
    });

    it('should get lang prefix', async () => {
      expect(new Mailer('fr-testing').lang).toMatch('fr');
    });
  });

  describe('"send"', () => {
    it('should call strategy', async () => {
      process.env.MAILER_STRATEGY = 'Test';
      await new Mailer('f').send();
      expect(strategies).toHaveBeenCalledWith(
        'Test',
        expect.any(Object),
      );
    });

    it('should delete template name', async () => {
      process.env.MAILER_STRATEGY = 'Test';
      const m = new Mailer('f');
      m.meta.html = '<br />';
      await m.send();

      expect(strategies).toHaveBeenCalledWith('Test', {
        html: '<br />',
      });
    });
  });

  describe('"attach"', () => {
    it('should attach', () => {
      const obj = {
        filename: 'foo',
        data: 'buf',
      };

      inst.attach(obj);
      expect(inst.meta).toHaveProperty('attachment', obj);
    });

    it('should error without buffer', () => {
      expect(() =>
        inst.attach({
          filename: 'foo',
          data: null,
        }),
      ).toThrowError();
    });

    it('should error without filename', () => {
      expect(() =>
        inst.attach({
          data: 'buf',
        }),
      ).toThrowError();
    });

    it('should attach multiple', () => {
      const obj = {
        filename: 'foo',
        data: 'buf',
      };

      inst.attach(obj);
      inst.attach(obj);
      expect(inst.meta).toHaveProperty('attachment', [
        obj,
        obj,
      ]);
    });
  });
});
