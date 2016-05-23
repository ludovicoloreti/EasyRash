var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
  "_id": String,
  "given_name": String,
  "family_name": String,
  "email": String,
  "pass": String,
  "sex": String
});


module.exports = mongoose.model('User', UserSchema);
