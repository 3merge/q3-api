const Handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');

const loadTemplate = (name) => {
  const tmp = path.resolve(
    __dirname,
    `./${name}.handlebars`,
  );

  return `${fs.readFileSync(tmp, 'utf8')}`;
};

/** Parts of email */
Handlebars.registerPartial('head', loadTemplate('head'));

Handlebars.registerHelper('list', (items, options) => {
  if (!items) return '';

  let out = `<table 
      class="attributes" 
      width="100%" 
      cellpadding="0" 
      cellspacing="0" 
      role="presentation"
      style="margin: 0 0 21px;"
    >
      <tr>
        <td 
          class="attributes_content"
          style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; background-color: #F4F4F7; padding: 16px;"
          bgcolor="#F4F4F7"
        >
          <table 
            width="100%" 
            cellpadding="0" 
            cellspacing="0" 
            role="presentation"
          >`;

  for (let i = 0, l = items.length; i < l; i += 1) {
    out = `${out}
      <tr>
        <td 
          class="attributes_item"
          style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 0;"
        >
          <span class="f-fallback">
            ${options.fn(items[i])}
          </span>
        </td>
      </tr>`;
  }

  return `${out}
        </table>
      </td>
    </tr>
  </table>`;
});

module.exports = loadTemplate;
