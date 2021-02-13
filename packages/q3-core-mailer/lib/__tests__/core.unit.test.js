jest.mock('q3-adapter-mailgun', () =>
  jest.fn().mockReturnValue({
    send: jest.fn(),
  }),
);

const Mailer = require('../core');

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

  describe('"send"', () => {
    it('should error', async () => {
      process.env.MAILER_STRATEGY = 'Test';
      expect(new Mailer('f').send()).rejects.toThrowError();
    });

    it('should resolve', async () => {
      process.env.MAILER_STRATEGY = 'Mailgun';
      expect(
        new Mailer('f').send(),
      ).resolves.not.toThrowError();
    });
  });
});
