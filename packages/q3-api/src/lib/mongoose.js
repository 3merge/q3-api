import mongoose from 'mongoose';
import i18 from './i18next';
import { ResourceNotFoundError } from '../helpers/errors';

mongoose.set('useEnsureIndex', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

mongoose.plugin((schema) => {
  // eslint-disable-next-line
  schema.statics.findStrictly = async function(id) {
    const doc = await this.findById(id).exec();
    if (!doc)
      throw new ResourceNotFoundError(
        i18.t('messages:missingResource'),
      );

    return doc;
  };

  Object.assign(schema.options, {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  });
});

export default mongoose;
