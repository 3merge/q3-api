import Q3 from 'q3-api';

const GetProfile = async ({ user }, res) => {
  res.ok({
    profile: user.obfuscatePrivateFields(),
  });
};

export default Q3.define(GetProfile);

// change LANGUAGE
