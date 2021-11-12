//jshint esversion:6

//Packages
const express = require("express");
const ejs = require("ejs");
const _ = require("lodash");
const morgan = require("morgan");
const mongoose = require("mongoose");
const md5 = require("md5");
const User = require("./models/user");

const app = express();

//Middlewares
app.use(express.static("public"));
app.use(express.urlencoded({
    extended: true
}));
app.use(morgan("dev"));
app.set("view engine", "ejs");

//Conection to mongoDB
const dbURI = "mongodb://localhost:27017/userDB";

mongoose.connect(dbURI)
    .then(() => {
        console.log("Connection to database successful");
        app.listen(3000, () => {
            console.log("Server started on port 3000");
        });
    })
    .catch(() => {
        console.log("Connection to database failed");
    });


//Routes
app.get("/", (req, res) => {
    res.render("home");
});

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res)=>{
        const userEmail = req.body.username;
        const userPassword = md5(req.body.password);
        
        User.findOne({email: userEmail})
        .then((doc)=>{
            if(doc.password === userPassword){
                res.render("secrets");
            } else {
                res.send("Incorrect Password");
            }
        })
        .catch(()=>{
            res.send("User not found");
        });
        
    });

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        const newUser = new User({
            email: req.body.username,
            password: md5(req.body.password)
        });
        newUser.save()
            .then(() => {
                res.render("secrets");
            })
            .catch((err) => {
                console.log(err);
                res.redirect("/");
            });
    });