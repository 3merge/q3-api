const axios = require('axios');
const { compose } = require('q3-core-composer');
const { map, pick } = require('lodash');

const WikiGetController = async (req, res) => {
  const { search } = req.query;

  const cql = search
    ? `text~"${search.split(' ').join('+')}"`
    : 'label=featured';

  const r = await axios.get(
    `https://3mergeinc.atlassian.net/wiki/rest/api/content/search/?cql=type=page+AND+space=GEN+AND+${cql}&expand=title`,
    {
      headers: {
        'Authorization': '',
      },
    },
  );

  res.ok({
    pages: map(r.data.results, (re) =>
      pick(re, ['id', 'title']),
    ),
  });
};

WikiGetController.authorization = [];
module.exports = compose(WikiGetController);
