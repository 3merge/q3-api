const { get } = require('lodash');
const {
  getFirstProperty,
  mapAsFileObject,
  reduceByFileName,
  startsWith,
} = require('./helpers');

module.exports = (AdapterInst, Datasource) =>
  Datasource.addMethod(
    /**
     * Takes the first file in the object and uploads it publicly.
     * @memberof module:PluginFilemanager
     * @method handleFeaturedUpload
     * @param {Object} files - An key-value pair of {filename : filedata}
     */
    async function handleFeaturedUpload({ files }) {
      const file = getFirstProperty(files);
      if (!file) return this;

      this.featuredUpload = await AdapterInst.add({
        filename: `${this.id}/${file.name}`,
        sensitive: false,
        ...file,
      });

      return this.save();
    },
  )

    .addMethod(
      /**
       * Somewhat of an alias for handleFeaturedUpload; however, it only accepts a single file.
       * @memberof module:PluginFilemanager
       * @method uploadFeaturePhotoFile
       * @param {Object} file - A single file object, comprising name, extension and data buffer
       */
      async function uploadFeaturePhotoFile(file) {
        return this.handleFeaturedUpload({
          [file.name]: file,
        });
      },
    )

    .addMethod(
      /**
       * Iterates over a given object of files and uploads each to a private bucket.
       * @memberof module:PluginFilemanager
       * @method handleUpload
       * @param {Object} files - An key-value pair of {filename : filedata}
       */
      async function handleUpload({ files }) {
        const pathMap = reduceByFileName(files);
        const op = mapAsFileObject(files, this.id, {
          sensitive: true,
        }).map(AdapterInst.add);

        await Promise.all(op).then((keys) =>
          Promise.all(
            keys.map((name) =>
              this.uploads.push({
                relativePath: pathMap[name],
                sensitive: true,
                name,
              }),
            ),
          ),
        );

        return this.save();
      },
    )

    .addMethod(
      /**
       * Iterates over a given object of files and uploads each to a private bucket.
       * @memberof module:PluginFilemanager
       * @method getFilePath
       * @param {String} relativePath - The file folder to which the target file belongs
       */
      function getFilePath(relativePath) {
        return Array.isArray(this.uploads)
          ? get(
              this.uploads.find((item) =>
                startsWith(item.relativePath, relativePath),
              ),
              'name',
            )
          : undefined;
      },
    )

    .addMethod(
      /**
       * For usage with request body and file payloads.
       * It abstracts the other methods and provides a single call for uploading featured and sensitive files.
       * @memberof module:PluginFilemanager
       * @method handleReq
       * @param {Object} body - An object for updating the primary dataset
       * @param {Object} files - An key-value pair of {filename : filedata}
       */
      async function handleReq({ body, files }) {
        if (files && this.handleFeaturedUpload) {
          if (files.featuredUpload)
            await this.uploadFeaturePhotoFile(
              files.featuredUpload,
            );
          else
            await this.handleUpload({
              files,
            });
        }

        if (body && body.featuredUpload === null)
          this.set({
            featuredUpload: undefined,
            photo: undefined,
          });
      },
    );
