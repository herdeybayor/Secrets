//jshint esversion:6

//Packages
const express = require("express");
const ejs = require("ejs");
const _ = require("lodash");
const fs = require("fs");
const https = require("https");
const path = require("path");
const morgan = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session")
const User = require("./models/user");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const findOrCreate = require("mongoose-findorcreate");

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
        const sslserver = https.createServer({
            key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
            cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem"))
        }, app);

        sslserver.listen(3000, () => {
            console.log("Secret app listening on port 3000! Go to https://localhost:3000/");
        });
    })
    .catch(() => {
        console.log("Connection to database failed");
    });

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "https://localhost:3000/auth/google/secrets"
    },
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        User.findOrCreate({
            googleId: profile.id
        }, function (err, user) {
            return cb(err, user);
        });
    }
));

passport.use(new FacebookStrategy({
        clientID: process.env.CLIENT_ID_FB,
        clientSecret: process.env.CLIENT_SECRET_FB,
        callbackURL: "https://localhost:3000/auth/facebook/secrets"
    },
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        User.findOrCreate({
            facebookId: profile.id
        }, function (err, user) {
            return cb(err, user);
        });
    }
));

passport.use(new GitHubStrategy({
        clientID: process.env.CLIENT_ID_GITHUB,
        clientSecret: process.env.CLIENT_SECRET_GITHUB,
        callbackURL: "https://localhost:3000/auth/github/secrets"
    },
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        User.findOrCreate({
            githubId: profile.id
        }, function (err, user) {
            return cb(err, user);
        });
    }
));

//Routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/auth/google",
    passport.authenticate("google", {
        scope: ["profile"]
    })
);

app.get("/auth/google/secrets",
    passport.authenticate("google", {
        failureRedirect: "/login"
    }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/secrets");
    });

app.get("/auth/facebook",
    passport.authenticate("facebook"));

app.get("/auth/facebook/secrets",
    passport.authenticate("facebook", {
        failureRedirect: "/login"
    }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/secrets");
    });

app.get('/auth/github',
    passport.authenticate('github'));

app.get('/auth/github/secrets',
    passport.authenticate('github', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/secrets');
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