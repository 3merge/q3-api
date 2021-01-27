# Exports

Q3 exporting is currently rudimentary. It supports `csv`,
`pdf` and `xlsl` but simply abstracts over other libraries,
so the data required to make each file type will differ.
Both `csv` and `xlsl` are largely the same, using just an
array of objects; whereas `pdf` generation will require
special objects shaped to match `pdfmake`.

Presently, the only option `Q3Exports` constructor takes is
`title`, which also only affects `xlsx` files. More to come
as further file types are added.

```javascript
const Q3Export = require('q3-exports');

new Q3Exports('xlsx', { title: 'My Custom Workbook' })
  .toBuffer([
    {
      col: 'Col1',
      col2: 'Col2',
      // ... etc
    },
  ])
  .then((buf) => {
    console.log(buf);
  });
```
