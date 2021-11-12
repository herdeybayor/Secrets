//jshint esversion:6

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

//Model
const User = new mongoose.model("User", userSchema);

//Exports
module.exports = User;