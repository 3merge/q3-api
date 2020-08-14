const AWSInterface = require('../../config/aws');

module.exports = class FileUploadAdapter {
  async handleUpload({ files }) {
    const sdk = AWSInterface();

    const method = sdk.addToBucket(true);
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
        keys.map((name) => {
          return this.uploads.push({
            relativePath: pathMap[name],
            sensitive: true,
            name,
          });
        }),
      ),
    );

    return this.save();
  }

  async handleFeaturedUpload({ files }) {
    const sdk = AWSInterface();
    const file = files[Object.keys(files)[0]];

    const method = sdk.addToBucket();
    const response = await method([
      `${this.id}/${file.name}`,
      file,
    ]);

    this.featuredUpload = response;
    return this.save();
  }

  async uploadFeaturePhotoFile(file) {
    const sdk = AWSInterface();
    const method = sdk.addToBucket();
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

    return this.uploads.find((item) => {
      return item.relativePath
        ? item.relativePath.startsWith(relativePath)
        : false;
    }).name;
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
};
