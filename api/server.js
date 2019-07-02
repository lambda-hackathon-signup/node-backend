const express = require("express");
const passport = require("passport");
const Strategy = require("passport-github").Strategy;

const Users = require("../users/users-model.js");

passport.use(
  new Strategy(
    {
      clientID: process.env["GITHUB_CLIENT_ID"],
      clientSecret: process.env["GITHUB_CLIENT_SECRET"],
      callbackURL: "/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      console.log("this is a profile:", profile);
      // profile.id, profile.displayName, profile.username
      let profileInfo = {
        githubId: profile.id,
        name: profile.displayName,
        username: profile.username
      };
      if (Users.findUser(profileInfo.githubId)) {
        console.log(
          `The profile with the username ${profileInfo.username} already exists`
        );
        done(null, profileInfo);
      } else {
        Users.add(profileInfo)
          .then(user => {
            done(null, user);
          })
          .catch(err => {
            console.log("Error saving user");
          });
      }

      // return done(null, profile);
    }
  )
);

// Configure Passport authenticated session persistence.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Users.findById(id).then(user => {
    done(null, user);
  });
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
    // console.log("user info:", req.user);
    res.render("profile", { user: req.user });
  }
);

module.exports = server;
