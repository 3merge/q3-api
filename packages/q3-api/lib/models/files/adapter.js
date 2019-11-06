const AWSInterface = require('../../config/aws');

module.exports = class FileUploadAdapter {
  async handleUpload({ files }) {
    const sdk = AWSInterface();

    const method = sdk.addToBucket(true);
    const data = Object.values(files).map((file) => [
      `${this.id}/${file.name}`,
      file,
    ]);

    await Promise.all(data.map(method)).then((keys) =>
      Promise.all(
        keys.map((name) =>
          this.uploads.push({
            sensitive: true,
            name,
          }),
        ),
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
};
