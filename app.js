//jshint esversion:6

//Packages
const express = require("express");
const ejs = require("ejs");
const _ = require("lodash");
const morgan = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session")
const User = require("./models/user");
const passport = require("passport");

const app = express();

//Middlewares
app.use(express.static("public"));
app.use(express.urlencoded({
    extended: true
}));
app.use(morgan("dev"));
app.set("view engine", "ejs");

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

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

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Routes
app.get("/", (req, res) => {
    res.render("home");
});

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, (err) => {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });
            }
        });

    });

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        User.register({
            username: req.body.username
        }, req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });
            }
        });

    });

app.route("/secrets")
    .get((req, res) => {
        if (req.isAuthenticated()) {
            res.render("secrets");
        } else {
            res.redirect("/login");
        }
    });

app.route("/logout")
    .get((req, res) => {
        req.logout();
        res.redirect("/");
    });