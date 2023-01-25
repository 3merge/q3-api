const mongoose = require('mongoose');
const i18next = require('i18next');
const notify = require('../../lib/notify');

const instance = notify({
  Domains: null,
  Notifications: null,
});

describe('notify', () => {
  it('should error without model keys', () => {
    expect(() => notify({})).toThrowError();
  });

  describe('getInAppLink', () => {
    it('should populate path by variable', () => {
      process.env.WEB_APP_PATH_MAKER =
        '/app/:messageType/:documentId#test=:subDocumentId';

      expect(
        instance({
          documentId: 1,
          messageType: 'test',
          subDocumentId: 2,
        }).getInAppLink(),
      ).toMatch('/app/test/1#test=2');
    });

    it('should populate path by constructor option', () => {
      const ctx = instance({
        documentId: 1,
        messageType: 'test',
        subDocumentId: 2,
      });

      ctx.$webAppPathMaker = '/foo/:documentId';
      expect(ctx.getInAppLink()).toMatch('/foo/1');
    });

    it('should return null when undefined variables', () => {
      const ctx = instance({});
      ctx.$webAppPathMaker = '/foo/:documentId';
      expect(ctx.getInAppLink()).toBeNull();
    });
  });

  describe('negateId', () => {
    it('should do nothing', () => {
      const output = instance({}).negateId({});
      expect(output).toEqual({});
    });

    it('should insert user ID as $and condition', () => {
      const _id = mongoose.Types.ObjectId();
      const userId = mongoose.Types.ObjectId();

      const output = instance({}).negateId.call(
        {
          $exemptUserId: true,
          $meta: {
            userId,
          },
        },
        {
          _id,
        },
      );

      expect(output).toEqual({
        _id,
        $and: [
          {
            $ne: userId,
          },
        ],
      });
    });

    it('should push user ID into $and condition', () => {
      const _id = mongoose.Types.ObjectId();
      const userId = mongoose.Types.ObjectId();

      const output = instance({}).negateId.call(
        {
          $exemptUserId: true,
          $meta: {
            userId,
          },
        },
        {
          _id,
          $and: [{ foo: 1 }],
        },
      );

      expect(output).toEqual({
        _id,
        $and: [
          {
            foo: 1,
          },
          {
            $ne: userId,
          },
        ],
      });
    });

    it('should add _id', () => {
      const userId = mongoose.Types.ObjectId();
      const output = instance({}).negateId.call(
        {
          $exemptUserId: true,
          $meta: {
            userId,
          },
        },
        {},
      );

      expect(output).toEqual({
        _id: {
          $ne: userId,
        },
      });
    });

    it('should create query', () => {
      const userId = mongoose.Types.ObjectId();
      const output = instance({}).negateId.call({
        $exemptUserId: true,
        $meta: {
          userId,
        },
      });

      expect(output).toEqual({
        _id: {
          $ne: userId,
        },
      });
    });
  });

  describe('concatOwnershipTextForUser', () => {
    it('should just return listener', () => {
      expect(
        instance({}).concatOwnershipTextForUser.call(
          {
            $listener: 'test',
          },
          {
            isDocumentMine: true,
            isSubDocumentMine: true,
          },
        ),
      ).toEqual('test');
    });

    it('should just add doc and subdoc text', () => {
      expect(
        instance({}).concatOwnershipTextForUser.call(
          {
            $listener: 'test',
            $withOwnership: true,
          },
          {
            isDocumentMine: true,
            isSubDocumentMine: true,
          },
        ),
      ).toEqual('testMyDocMySubDoc');
    });
  });

  describe('isUserEqualTo', () => {
    it('should return truthy', () => {
      const foo = mongoose.Types.ObjectId();

      expect(
        instance({}).isUserEqualTo.call(
          {
            $meta: {
              foo,
            },
          },
          {
            _id: foo,
          },
        )('foo'),
      ).toBeTruthy();
    });

    it('should return falsy', () => {
      expect(
        instance({}).isUserEqualTo.call(
          {
            $meta: {
              foo: mongoose.Types.ObjectId(),
            },
          },
          {
            _id: mongoose.Types.ObjectId(),
          },
        )('foo'),
      ).toBeFalsy();
    });

    it('should return truthy', () => {
      expect(
        instance({}).isUserEqualTo.call(
          {
            $meta: {
              foo: '123',
            },
          },
          {
            _id: '123',
          },
        )('foo'),
      ).toBeTruthy();
    });
  });

  describe('translateForUser', () => {
    it('should', () => {
      const t = jest.fn();
      const spy = jest
        .spyOn(i18next, 'getFixedT')
        .mockReturnValue(t);

      instance({}).translateForUser({
        lang: 'es',
      })('messages');

      expect(spy).toHaveBeenCalledWith('es');
      expect(t).toHaveBeenCalledWith('messages:notify', {});
    });
  });

  describe('wantsBy', () => {
    it('should return false without any listens', () => {
      expect(
        instance({}).wantsBy.call(
          {
            $listener: 'test',
          },
          {
            listens: [],
          },
        ),
      ).toBeFalsy();
    });

    it('should return false without variant match', () => {
      expect(
        instance({}).wantsBy.call(
          {
            $listener: 'test',
          },
          {
            listens: ['test__text', 'test__email'],
          },
          'app',
        ),
      ).toBeFalsy();
    });

    it('should return true with variant match', () => {
      expect(
        instance({}).wantsBy.call(
          {
            $listener: 'test',
          },
          {
            listens: ['test__text', 'test__email'],
          },
          'text',
        ),
      ).toBeTruthy();
    });

    it('should return true with listener match and no variants', () => {
      expect(
        instance({}).wantsBy.call(
          { $listener: 'test' },
          { listens: ['test', 'test1'] },
          'text',
        ),
      ).toBeTruthy();
    });

    it('should return false with no matches', () => {
      expect(
        instance({}).wantsBy.call(
          { $listener: 'foo' },
          { listens: ['test', 'test1'] },
          'text',
        ),
      ).toBeFalsy();
    });
  });
});
