exports.assignSocialStatus =
  function measureHowManyFriends() {
    const { length } = this.friends;

    if (length > 0 && length < 5) {
      this.socialStatus = 'Freshman';
    } else if (length > 5) {
      this.socialStatus = 'Senior';
    } else {
      this.socialStatus = 'New';
    }
  };
