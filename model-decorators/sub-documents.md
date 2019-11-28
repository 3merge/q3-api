---
description: Q3 registers a global mongoose plugin for easier sub-document management.
---

# Sub-documents

| Method | Description | Parameters | Async |
| :--- | :--- | :--- | :--- |
| getSubDocument | Lookup a single sub-document by its ID | field \(String\), id \(String\) | No |
| pushSubDocument | Add to a new or existing embedded array | field \(String\), document \(Object\) | Yes |
| removeSubDocument | Remove a single or set of sub-documents | field \(String\), id \(String or Array\) | Yes |
| updateSubDocument | Update part of a sub-document record | field \(String\), id \(String\), arguments \(Object\) | Yes |

