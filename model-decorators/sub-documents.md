---
description: Q3 registers a global mongoose plugin for easier subdocument management.
---

# Subdocuments

### API reference

| Method | Description | Parameters |
| :--- | :--- | :--- |
| `getSubDocument` | Lookup a single sub-document by its ID | `field (String), id (String)` |
| `pushSubDocument` | Add to a new or existing embedded array | `field (String), document (Object)` |
| `removeSubDocument` | Remove a single or set of sub-documents | `field (String), id (String or Array)` |
| `updateSubDocument` | Update part of a sub-document record | `field (String), id (String), arguments (Object)` |

### Example code

```javascript
// Let's make John
const doc = Model.create({ 
    name: "John",
});

// John finds a new friend
const { friends: [{ _id }] } = await doc.pushSubDocument('friends', { 
    name: "Jen",
});

// John's friend changes her name
await doc.updateSubDocument('friends', _id, { name: "Jennifer" });

// John no longer has any friends.
await doc.removeSubDocument('friends', _id);


```

