const { exception } = require('q3-api');
const { Schema } = require('mongoose');

class ModelDecorator {
  async populateAuthors() {
    const select = 'firstName, lastName, email';
    return this.populate({
      path: 'thread.author',
      select,
    }).execPopulate();
  }

  async checkIfThreadExists(id) {
    const subdoc = this.thread.id(id);

    if (!subdoc)
      exception('ResourceNotFound')
        .msg('threadNotFound')
        .throw();

    return subdoc;
  }

  async findThreadStrictly(id) {
    await this.populateAuthors();
    return this.checkIfThreadExists(id);
  }

  async addToThread(args) {
    this.thread.addToSet(args);
    await this.save();
    return this.toJSON();
  }

  async removeFromThread(id) {
    await this.checkIfThreadExists(id);
    this.thread.remove(id);
    return this.save();
  }
}

module.exports = (ref = 'q3-api-users') => {
  const Base = new Schema(
    {
      topic: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
      },
      subscribers: [
        {
          type: Schema.Types.ObjectId,
          ref,
        },
      ],
      thread: [
        {
          author: {
            type: Schema.Types.ObjectId,
            ref,
          },
          date: {
            type: Date,
          },
          message: {
            type: String,
            required: true,
          },
        },
      ],
    },
    { timestamps: true },
  );

  Base.loadClass(ModelDecorator);

  // eslint-disable-next-line
  Base.pre('save', async function(next) {
    let err;
    if (
      this.isNew &&
      (await this.constructor
        .countDocuments({
          topic: this.topic,
        })
        .exec())
    )
      err = exception('Conflict')
        .msg('duplicateNote')
        .boomerang();

    next(err);
  });

  return Base;
};
