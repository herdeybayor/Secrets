//jshint esversion:6
require('dotenv').config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

//Schema
const userSchema = new Schema({
    email: String,
    password: String,
    googleId: String,
    facebookId: String,
    githubId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//Model
const User = new mongoose.model("User", userSchema);

//Exports
module.exports = User;