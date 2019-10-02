const Q3 = require('q3-api').default;
const { Errors } = require('q3-api');
const { Schema } = require('mongoose');

class ModelDecorator {
  static async findNoteStrictly(id) {
    const doc = await this.findById(id);
    if (!id)
      throw new Errors.ResourceNotFoundError(
        Q3.translate('messages:noteNotFound'),
      );

    return doc;
  }

  async findThreadStrictly(id) {
    const subdoc = this.thread.id(id);
    if (!subdoc)
      throw new Errors.ResourceNotFoundError(
        Q3.translate('messages:threadNotFound'),
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
