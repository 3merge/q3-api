module.exports = (AdapterInst, Datasource) =>
  Datasource.define({
    name: {
      type: Datasource.Types.String,
      required: true,
      systemOnly: true,
    },
    relativePath: {
      type: Datasource.Types.String,
    },
    sensitive: {
      type: Datasource.Types.Boolean,
      default: false,
    },
  })
    .addVirtualGetter(
      'url',

      /**
       * Gets the http address of the file.
       * @name url
       * @type {String}
       */
      function getHttpAddressOfFilePath(value, v, doc) {
        try {
          return AdapterInst.get({
            filename: `${doc.parent().id}/${doc.name}`,
            ...doc,
          });
        } catch (e) {
          return null;
        }
      },
    )
    .addPathSetter(
      'name',

      /**
       * Sets the previous document's name to $locals.prev during hook execution.
       * @name name
       * @type {String}
       */
      function savePreviousFileName(newVal) {
        if (this.$locals && this.name)
          this.$locals.prev = this.name;

        return newVal;
      },
    );
