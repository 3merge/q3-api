module.exports = (Adapter) => ({
  async handleUpload({ files }) {
    const pathMap = Object.entries(files).reduce(
      (acc, [next, file]) => {
        acc[file.name] = next;
        return acc;
      },
      {},
    );

    const data = Object.values(files).map((file) => ({
      filename: `${this.id}/${file.name}`,
      sensitive: true,
      data: file,
    }));

    await Promise.all(data.map(Adapter.add)).then((keys) =>
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
});
