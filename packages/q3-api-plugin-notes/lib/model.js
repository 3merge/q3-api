const { exception } = require('q3-api');
const { Schema } = require('mongoose');

class ModelDecorator {
  async findThreadStrictly(id, user) {
    await this.populate({
      path: 'thread.author',
      select: 'firstName, lastName, _id, email',
    }).execPopulate();
    const subdoc = this.thread.id(id);

    if (!subdoc)
      exception('ResourceNotFound')
        .msg('threadNotFound')
        .throw();

    if (!subdoc.author)
      exception('BadRequest')
        .msg('unknownAuthor')
        .throw();

    if (!user || !subdoc.author.equals(user.id))
      exception('Authorization')
        .msg('mustOwnThread')
        .throw();

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
  return Base;
};
