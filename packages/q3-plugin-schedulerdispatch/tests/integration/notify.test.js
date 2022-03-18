const Mailer = require('q3-core-mailer/lib/core');
const mongoose = require('mongoose');
const i18next = require('i18next');
const notify = require('../../lib/notify');

i18next.init({});
i18next.addResourceBundle('en', 'messages', {
  onTest: 'Testing locale',
});

const spy = jest
  .spyOn(Mailer.prototype, 'send')
  .mockReturnValue(null);

// just for init values
mongoose.model('emails', new mongoose.Schema({}));

const Domains = mongoose.model(
  'domains',
  new mongoose.Schema({
    listens: mongoose.Schema.Types.Mixed,
    tenant: String,
  }),
);

const Notifications = mongoose.model(
  'notifications',
  new mongoose.Schema({
    label: String,
    excerpt: String,
    localUrl: String,
    documentId: mongoose.Types.ObjectId,
    subDocumentId: mongoose.Types.ObjectId,
    documentAuthor: mongoose.Types.ObjectId,
    subDocumentAuthor: mongoose.Types.ObjectId,
    user: mongoose.Types.ObjectId,
  }),
);

const Users = mongoose.model(
  'users',
  new mongoose.Schema({
    active: Boolean,
    firstName: String,
    lastName: String,
    lang: String,
    email: String,
    listens: [String],
    role: String,
  }),
);

let userId;
let userId2;

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
  await Domains.create({
    listens: {
      Developer: ['onTest'],
    },
  });

  [{ _id: userId }, { _id: userId2 }] = await Users.create([
    {
      active: true,
      firstName: 'J',
      lastName: 'S',
      email: 'js@test.ca',
      listens: ['onTest'],
      role: 'Developer',
    },
    {
      active: true,
      firstName: 'J2',
      lastName: 'S2',
      email: 'js2@test.ca',
      listens: ['onTest'],
      role: 'Developer',
    },
  ]);
});

afterAll(async () => {
  await Domains.deleteMany({});
  await Notifications.deleteMany({});
  await Users.deleteMany({});
  mongoose.disconnect();
});

describe('notify', () => {
  it('should', async () => {
    process.env.WEB_APP_PATH_MAKER =
      '/app/:messageType/:documentId';

    const input = {
      documentId: mongoose.Types.ObjectId(),
      documentAuthor: userId,
      subDocumentId: mongoose.Types.ObjectId(),
      messageType: 'testing',
      userId: userId2,
    };

    const fn = notify({
      Domains,
      Notifications,
    });

    const n = fn(input, {
      filename: 'onTest',
      withOwnership: true,
    });

    n.exemptUserId();
    await n.loadUsers();
    await n.forEachUserAsync(async (user) => {
      expect(user).toHaveProperty('isDocumentMine', true);
      expect(user).toHaveProperty(
        'isSubDocumentMine',
        false,
      );
    });

    await n.notify();
    await n.send();

    expect(n.$users).toHaveLength(1);
    expect(spy).toHaveBeenCalled();
    const [noti] = await Notifications.find();

    expect(noti).toMatchObject({
      label: 'Testing locale',
      excerpt: 'onTest',
      localUrl: `/app/testing/${input.documentId.toString()}`,
    });
  });
});
