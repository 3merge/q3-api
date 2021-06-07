module.exports = class UserAuthDecorator {
  static async isListeningFor(listens = '') {
    try {
      const users = await this.find({
        listens,
      }).exec();

      return users ? users.map((user) => user.email) : [];
    } catch (e) {
      return [];
    }
  }
};
