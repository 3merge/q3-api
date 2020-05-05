const Q3 = require('q3-api');
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    name: String,
    socialStatus: String,
    friends: [
      {
        name: String,
        age: Number,
      },
    ],
  },
  {
    restify: '*',
    collectionPluralName: 'students',
    collectionSingularName: 'student',
  },
);

StudentSchema.pre('save', function assignSocialStatus() {
  const { length } = this.friends;

  if (length === 0) this.socialStatus = 'New';

  if (length > 0 && length < 5)
    this.socialStatus = 'Freshman';

  if (length > 5) this.socialStatus = 'Senior';
});

module.exports = Q3.setModel('students', StudentSchema);
