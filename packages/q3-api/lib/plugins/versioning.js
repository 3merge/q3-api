/* eslint-disable func-names, no-param-reassign */
const { Schema } = require('mongoose');
const { set, get } = require('lodash');
const ctx = require('request-context');

const version = new Schema({
  versions: {
    select: false,
    type: [
      new Schema(
        {
          diff: Schema.Types.Mixed,
          user: Schema.Types.ObjectId,
        },
        {
          _id: false,
          id: false,
          timestamps: true,
          disableArchive: true,
          capped: {
            max: 100,
          },
        },
      ),
    ],
  },
});

const plugin = (schema) => {
  if (schema.options.version) {
    schema.add(version);

    schema.pre('save', async function() {
      const mods = this.modifiedPaths({
        includeChildren: true,
      });

      const prev = await this.constructor
        .findById(this._id)
        .select('+versions')
        .lean();

      const diff = mods.reduce(
        (a, mod) => set(a, mod, get(prev, mod)),
        {},
      );

      const hasLength = Object.keys(diff).length;
      const changelog = {
        user: ctx.get('q3-session:user.id'),
        diff,
      };

      if (hasLength && prev)
        this.versions = [
          changelog,
          ...(prev.versions ? prev.versions : []),
        ];
    });
  }
};

module.exports = plugin;
