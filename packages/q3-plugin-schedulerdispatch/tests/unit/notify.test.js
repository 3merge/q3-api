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
    it('should return null', () => {
      const fn = notify({
        Domains: null,
        Notifications: null,
      });

      expect(
        fn({ documentId: 1 }).getInAppLink(),
      ).toBeNull();
    });

    it('should populate path', () => {
      process.env.WEB_APP_PATH_MAKER =
        '/app/:messageType/:documentId';

      expect(
        instance({
          documentId: 1,
          messageType: 'test',
        }).getInAppLink(),
      ).toMatch('/app/test/1');
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
});