const AWSInterface = require('../../config/aws');

module.exports = class FileUploadAdapter {
  async handleUpload({ sensitive = false, files }) {
    const sdk = AWSInterface();

    const method = sdk.addToBucket(sensitive);
    const data = Object.values(files).map((file) => [
      `${this.id}/${file.name}`,
      file,
    ]);

    await Promise.all(data.map(method)).then((keys) =>
      Promise.all(
        keys.map((name) =>
          this.uploads.push({
            sensitive,
            name,
          }),
        ),
      ),
    );

    return this.save();
  }

  async handleFeaturedUpload({ files }) {
    const sdk = AWSInterface();

    const method = sdk.addToBucket();
    const response = await method([
      `${this.id}/${files.featured.name}`,
      files.featured,
    ]);

    this.featuredUpload = response;
    return this.save();
  }
};
