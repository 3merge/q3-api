const axios = require('axios');
const { compose } = require('q3-core-composer');

const WikiGetController = async (req, res) => {
  const {
    data: { title, body },
  } = await axios.get(
    `https://3mergeinc.atlassian.net/wiki/rest/api/content/${req.params.wikiID}?expand=body.storage`,
    {
      headers: {
        'Authorization': '',
      },
    },
  );

  // IF SPACE MATCHES...

  res.ok({
    title,
    html: body.storage.value,
  });
};

WikiGetController.authorization = [];
module.exports = compose(WikiGetController);
