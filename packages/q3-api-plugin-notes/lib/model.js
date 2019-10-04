const { exception, translate } = require('q3-api');
const { Schema } = require('mongoose');

class ModelDecorator {
  static async findNoteStrictly(id) {
    const doc = await this.findById(id);
    if (!id)
      exception('ResourceNotFound').throw(
        translate('messages:noteNotFound'),
      );

    return doc;
  }

  findThreadStrictly(id, user) {
    const subdoc = this.thread.id(id);
    if (!subdoc)
      exception('ResourceNotFoundError').throw(
        translate('messages:threadNotFound'),
      );

    if (!subdoc.author.equals(user.id))
      exception('AuthorizationError').throw(
        translate('messages:mustOwnThread'),
      );

    return subdoc;
  }

  async addToThread(args) {
    this.thread.addToSet(args);
    await this.save();
    return this.toJSON({
      virtuals: true,
    });
  }

  async removeFromThread(id) {
    this.thread.remove(id);
    return this.save();
  }
}

module.exports = (ref = 'q3-users') => {
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
  return Base;
};
