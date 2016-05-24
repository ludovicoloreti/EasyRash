var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
  "_id": String,
  "given_name": String,
  "family_name": String,
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
