const express = require("express");
const passport = require("passport");
const Strategy = require("passport-github").Strategy;

passport.use(
  new Strategy(
    {
      clientID: process.env["GITHUB_CLIENT_ID"],
      clientSecret: process.env["GITHUB_CLIENT_SECRET"],
      callbackURL: "/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      // In this example, the user's Facebook profile is supplied as the user
      // record.  In a production-quality application, the Facebook profile should
      // be associated with a user record in the application's database, which
      // allows for account linking and authentication with other identity
      // providers.
      return cb(null, profile);
    }
  )
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const server = express();

server.use(express.json());

// Configure view engine to render EJS templates.
server.set("views", __dirname + "/views");
server.set("view engine", "ejs");

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
server.use(require("morgan")("combined"));
server.use(require("cookie-parser")());
server.use(require("body-parser").urlencoded({ extended: true }));
server.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);

server.use(passport.initialize());
server.use(passport.session());

server.get("/", (req, res) => {
  res.render("home", { user: req.user });
});

server.get("/login", (req, res) => {
  res.render("login");
});

server.get("/login/github", passport.authenticate("github"));

server.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

server.get(
  "/profile",
  require("connect-ensure-login").ensureLoggedIn(),
  (req, res) => {
    console.log(req.user);
    res.render("profile", { user: req.user });
  }
);

module.exports = server;
