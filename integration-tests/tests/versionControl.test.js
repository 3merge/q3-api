const mongoose = require('mongoose');
const vc = require('q3-core-version');

const StudentSchema = new mongoose.Schema({
  name: String,
  socialStatus: String,
  friends: [
    {
      name: String,
      age: Number,
    },
  ],
});

StudentSchema.plugin(vc, mongoose);

StudentSchema.pre('save', function assignSocialStatus() {
  const { length } = this.friends;

  if (length === 0) this.socialStatus = 'New';

  if (length > 0 && length < 5)
    this.socialStatus = 'Freshman';

  if (length > 5) this.socialStatus = 'Senior';
});

const Student = mongoose.model(
  'version-controlled-students',
  StudentSchema,
);

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Version control plugin', () => {
  it('should ignore automated field changes', async () => {
    const d = await Student.create({
      name: 'George',
    });

    d.$locals.$raw = {
      friends: [{ name: 'Jon' }],
    };

    d.friends = d.$locals.friends;
    await d.save();

    d.__$q3 = {
      USER: {
        firstName: 'Mike',
      },
    };

    d.$locals = {
      friends: [{ name: 'Jon' }],
    };

    const history = await d.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].modified).toHaveProperty('friends');
    expect(history[0].modified).not.toHaveProperty(
      'socialStatus',
    );
  });
});
