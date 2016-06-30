var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
  "_id": {
    type: String,
    required: true,
    unique: true
  },
  "given_name": {
    type: String,
    required: true
  },
  "family_name": {
    type: String,
    required: true
  },
  "email": {
    type: String,
    required: true,
    unique: true
  },
  "pass":{
    type: String,
    required: true
  },
  "sex": String
});

// for protected passwords: https://devdactic.com/restful-api-user-authentication-1/

module.exports = mongoose.model('User', UserSchema);
