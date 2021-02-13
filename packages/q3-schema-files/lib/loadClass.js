const FileAdapter = require('q3-core-files').adapter;
const Schema = require('./schema');

class FileUtilities {
  async handleUpload({ files }) {
    const method = FileAdapter.addToBucket(true);
    const pathMap = Object.entries(files).reduce(
      (acc, [next, file]) => {
        acc[file.name] = next;
        return acc;
      },
      {},
    );

    const data = Object.values(files).map((file) => [
      `${this.id}/${file.name}`,
      file,
    ]);

    await Promise.all(data.map(method)).then((keys) =>
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
  }

  async handleFeaturedUpload({ files }) {
    const file = files[Object.keys(files)[0]];
    const method = FileAdapter.addToBucket();
    const response = await method([
      `${this.id}/${file.name}`,
      file,
    ]);

    this.featuredUpload = response;
    return this.save();
  }

  async uploadFeaturePhotoFile(file) {
    const method = FileAdapter.addToBucket();
    const response = await method([
      `${this.id}/${file.name}`,
      file,
    ]);

    this.featuredUpload = response;
    return this.save();
  }

  getFilePath(relativePath) {
    if (!this.uploads || !Array.isArray(this.uploads))
      return undefined;

    const file = this.uploads.find((item) =>
      item.relativePath
        ? item.relativePath.startsWith(relativePath)
        : false,
    );

    return file ? file.name : null;
  }

  async handleReq({ body, files }) {
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

    if (body.featuredUpload === null)
      this.set({
        featuredUpload: undefined,
        photo: undefined,
      });
  }

  async moveFileTo(relativePath, targetDestination) {
    return FileAdapter.copyFrom(
      `${this._id.toString()}/${relativePath}`,
      targetDestination,
    );
  }
}

Schema.loadClass(FileUtilities);

module.exports = FileUtilities;
