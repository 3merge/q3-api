const mongoose = require('mongoose');
const {
  isFunction,
  reduce,
  omit,
  includes,
  map,
} = require('lodash');
const { exception } = require('q3-core-responder');
const Schema = require('../schema');

class Commander {
  addToEntries(args) {
    this.entries.push(args);
    return this;
  }

  mapEntries(visibilityOptions = {}) {
    const omissions = ['_id', 'createdAt', 'updatedAt'];
    const { developer = false, role } = visibilityOptions;

    if (!developer) {
      omissions.push(['visibility']);
    }

    return reduce(
      this.entries,
      (acc, curr) => {
        const entry = curr.toJSON();
        const { _id: id, visibility } = entry;

        return developer || includes(visibility, role)
          ? acc.concat({
              ...omit(entry, omissions),
              collectionName: this.collectionName,
              id,
            })
          : acc;
      },
      [],
    );
  }

  removeEntry({ id }) {
    this.entries.forEach((item) => {
      try {
        if (item.folderId.equals(id)) {
          item.remove();
        }
      } catch (e) {
        // noop
      }
    });

    this.entries.id(id).remove();
    return this;
  }

  renameEntry({ id, label }) {
    this.entries.id(id).set({
      label,
    });

    return this;
  }

  reorderEntries({ segments: sorted }) {
    this.entries = map(sorted, ({ folderId, id }) => ({
      ...this.entries.find((prevItem) =>
        prevItem._id.equals(id),
      ),
      folderId: folderId
        ? mongoose.Types.ObjectId(folderId)
        : null,
      id,
    }));

    return this;
  }

  replaceEntry({ id, value }) {
    this.entries.id(id).set({
      value,
    });

    return this;
  }

  replaceEntryVisibility({ id, visibility = [] }) {
    this.entries.id(id).set({
      visibility,
    });

    return this;
  }

  async execCmd(cmd, args) {
    const f = {
      create: this.addToEntries,
      remove: this.removeEntry,
      rename: this.renameEntry,
      replace: this.replaceEntry,
      reorder: this.reorderEntries,
      replaceVisibility: this.replaceEntryVisibility,
    }[cmd];

    if (!isFunction(f))
      exception('Validation')
        .msg('unknownSegmentCommand')
        .throw();

    f.call(this, args);
    await this.save();
  }
}

Schema.loadClass(Commander);
module.exports = Commander;
