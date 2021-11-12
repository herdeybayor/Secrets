//jshint esversion:6

const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
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

//Mongoose Encryption
const secret = "This is our little secret.";
userSchema.plugin(encrypt, {
    secret: secret,
    encryptedFields: ["password"]
});


//Model
const User = new mongoose.model("User", userSchema);

//Exports
module.exports = User;