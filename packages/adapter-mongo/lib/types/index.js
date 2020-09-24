const mongoose = require('mongoose');

const { Types } = mongoose.Schema;

// assign plain JS object types for consistency
// can't assume other ORMs will allow these
Types.Boolean = Boolean;
Types.Date = Date;
Types.Number = Number;
Types.String = String;

module.exports = Types;
