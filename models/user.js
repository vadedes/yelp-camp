const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

//this plugin will automatically add username and password fields
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
