const { get } = require('lodash');
const AWSInterface = require('../../config/aws');

const normalize = (xs) =>
  ['', 'null', 'undefined'].includes(String(xs))
    ? null
    : xs;

const explodeName = (name) => {
  const r = String(name).match(/\[([a-zA-Z0-9])*\]/);

  if (!r)
    return {
      folderId: null,
      name,
    };

  const [folderInParenthesis] = r;
  const folderId = normalize(
    folderInParenthesis.slice(1, -1),
  );

  const isolatedName = name.replace(
    folderInParenthesis,
    '',
  );

  return {
    folderId,
    name: isolatedName,
  };
};

module.exports = class FileUploadAdapter {
  async handleUpload({ files, sensitive = true }) {
    const bool =
      String(sensitive) === 'true' || sensitive === true;

    const sdk = AWSInterface();
    const method = sdk.addToBucket(bool);
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
            sensitive: bool,
            size: get(files, `${pathMap[name]}.size`, 0),
            ...explodeName(name),
          }),
        ),
      ),
    );

    return this;
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
          sensitive: get(body, 'sensitive'),
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
    return AWSInterface().copyFrom(
      `${this._id.toString()}/${relativePath}`,
      targetDestination,
    );
  }
};
