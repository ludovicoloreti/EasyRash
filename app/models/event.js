var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventSchema = Schema({
  conference: String,
  acronym: String,
  chairs: [String],
  pc_members: [String],
  submissions: [{type: Schema.ObjectId, ref: 'Submission'}]
});

var SubmissionSchema = Schema({
  titile: String,
  url: String,
  authors: [String],
  reviewers: [String]
});

module.exports = mongoose.model('Event', EventSchema);
