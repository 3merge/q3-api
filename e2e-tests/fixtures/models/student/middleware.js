exports.assignSocialStatus = function measureHowManyFriends() {
  const { length } = this.friends;

  switch (length) {
    case length > 0 && length < 5:
      this.socialStatus = 'Freshman';
      break;
    case length > 5:
      this.socialStatus = 'Senior';
      break;
    default:
      this.socialStatus = 'New';
      break;
  }
};
