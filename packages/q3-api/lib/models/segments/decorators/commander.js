const mongoose = require('mongoose');
const {
  isFunction,
  reduce,
  omit,
  includes,
  forEach,
  find,
  some,
} = require('lodash');
const { exception } = require('q3-core-responder');
const Schema = require('../schema');
const {
  objectIdEquals,
} = require('../../../helpers/utils');

const toJSON = (xs) =>
  // only available during non-lean queries
  isFunction(xs.toJSON) ? xs.toJSON() : xs;

class Commander {
  addToEntries(args) {
    if (Array.isArray(this.entries))
      this.entries.push(args);
    else this.entries = [args];
    return this;
  }

  getEntry(id) {
    try {
      const item = this.entries.id(id);
      if (!item) throw new Error();
      return item;
    } catch (e) {
      return exception('Validation')
        .msg('unknownSegmentEntryId')
        .throw();
    }
  }

  mapEntries(visibilityOptions = {}) {
    const omissions = ['_id', 'createdAt', 'updatedAt'];
    const { developer = false, role } = visibilityOptions;

    if (!developer) {
      omissions.push(['visibility']);
    }

    const inheritVisibility = (xs) =>
      some(this.entries, (entry) => {
        const {
          _id: id,
          folder,
          folderId,
          visibility,
        } = toJSON(entry);

        return objectIdEquals(id, xs)
          ? false
          : objectIdEquals(folderId, xs) &&
              ((!folder && includes(visibility, role)) ||
                (folder && inheritVisibility(id)));
      });

    return reduce(
      this.entries,
      (acc, curr) => {
        const entry = toJSON(curr);
        const { _id: id, folder, visibility } = entry;

        return developer ||
          includes(visibility, role) ||
          (folder && inheritVisibility(id))
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
    this.getEntry(id).remove();
    forEach(this.entries, (item) => {
      if (objectIdEquals(item.folderId, id)) {
        item.remove();
      }
    });

    return this;
  }

  getEntryAndSet(id, args) {
    this.getEntry(id).set(args);
    return this;
  }

  renameEntry({ id, label }) {
    return this.getEntryAndSet(id, {
      label,
    });
  }

  reorderEntries({ entries }) {
    this.entries = reduce(
      entries,
      (acc, curr) => {
        const { folderId, id } = curr;
        const match = find(this.entries, (prevItem) =>
          objectIdEquals(prevItem._id, id),
        );

        if (match)
          acc.push({
            ...toJSON(match),
            folderId: folderId
              ? mongoose.Types.ObjectId(folderId)
              : null,
          });

        return acc;
      },
      [],
    );

    return this;
  }

  replaceEntry({ id, value }) {
    return this.getEntryAndSet(id, {
      value,
    });
  }

  replaceEntryVisibility({ id, visibility = [] }) {
    return this.getEntryAndSet(id, {
      visibility,
    });
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
