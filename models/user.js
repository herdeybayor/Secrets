//jshint esversion:6
require('dotenv').config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

//Schema
const userSchema = new Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

//Model
const User = new mongoose.model("User", userSchema);

//Exports
module.exports = User;