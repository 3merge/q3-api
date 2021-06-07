# Composer

## API

### Middleware

This package registers a few methods onto the request
object, most of which help with authenticating and
authorizing.

#### Request.authorizeBody()

Redact the request's body to safely update documents.

##### Parameters

- `«Object(optional)»` A document to consider during
  redaction. Useful for triggering test cases with
  conditional access control grants.
- `«String(optional)»` A collection to query for grants.
  Q3-core-rest automates this value's assignment.
- `«String(optional)»` A field under which the body should
  be tested (i.e. sub-documents). Q3-core-rest automates
  this value's assignment.
- `«String(optional)»` An ID to load a sub-document into the
  document context. Useful for triggering test cases on
  nested access control grants.

##### Returns

- `«Object»` The redacted request body

##### Example

```javascript
module.exports = async function controller(req, res) {
  const doc = await Model.findById(req.id);
  const subdoc = doc;

  const body = req.authorizeBody(
    doc, // the parent document
    'test-collection', // the collection to pull grants from
    'sample', // the sub-document name
    req.sampleId, // the sub-document id
  );

  doc.sample.id(req.sampleId).set(body);
  await doc.save();

  res.status(200).json({
    ok: 1,
  });
};
```
