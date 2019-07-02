const express = require("express");
const passport = require("passport");
const Strategy = require("passport-github").Strategy;
const cookieSession = require("cookie-session");

const Users = require("../users/users-model.js");

// Configure Passport authenticated session persistence.
passport.serializeUser((user, done) => {
  // console.log(user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Users.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new Strategy(
    {
      clientID: process.env["GITHUB_CLIENT_ID"],
      clientSecret: process.env["GITHUB_CLIENT_SECRET"],
      callbackURL:
        "https://lambda-projects-hackathon.herokuapp.com/auth/github/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      let profileInfo = {
        githubId: profile.id,
        name: profile.displayName,
        username: profile.username
      };
      const ghId = profileInfo.githubId;
      Users.findUser(ghId).then(currentUser => {
        if (currentUser) {
          done(null, currentUser);
        } else {
          Users.add(profileInfo)
            .then(user => {
              done(null, user);
            })
            .catch(err => {
              console.log("Error saving user");
            });
        }
      });
    }
  )
);

const server = express();

server.use(express.json());

server.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env["COOKIE_KEY"]]
  })
);

// Configure view engine to render EJS templates.
server.set("views", __dirname + "/views");
server.set("view engine", "ejs");

server.use(require("morgan")("combined"));

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

server.get("/profile", (req, res) => {
  res.render("profile", { user: req.user });
});

module.exports = server;
