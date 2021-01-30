var express = require("express");
var { body, validationResult } = require("express-validator");
var router = express.Router();
var bcrypt = require("bcryptjs");
var passport = require("passport");

var User = require("../models/user");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/login", function (req, res, next) {
  console.log(req.flash("info"));
  res.render("login", { messages: req.flash("info") });
});

router.get("/signup", function (req, res, next) {
  res.render("signup");
});

router.get("/create-post", function (req, res, next) {
  res.render("create-post");
});

router.get("/become-a-member", function (req, res, next) {
  // Redirect to / if not logged in
  res.render("become-a-member");
});

router.post(
  "/become-a-member",
  body("secretPassword")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Please enter a password")
    .toLowerCase()
    .equals("secret password")
    .withMessage("You are not worthy"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("become-a-member", { errors: errors.array() });
      return;
    } else {
    }
  }
);

router.post(
  "/signup",
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email")
    .custom((email) => {
      return User.find({ email: email }).then((user) => {
        if (user.length) {
          return Promise.reject("Email is already in use");
        }
      });
    }),
  body("password-confirm").custom((passwordConfirmation, { req }) => {
    if (passwordConfirmation !== req.body.password) {
      throw new Error("Confirm password does not match password");
    }
    return true;
  }),
  body("password").isLength({ min: 8 }).withMessage("Password is too short"),
  body("firstname")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Please enter a first name")
    .isLength({ max: 50 })
    .withMessage("First name is too long"),
  body("lastname")
    .trim()
    .isLength({ max: 50 })
    .escape()
    .withMessage("Last name is too long"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("signup", { errors: errors.array() });
      return;
    } else {
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) return next(err);
        const user = new User({
          first_name: req.body.firstname,
          email: req.body.email,
          registration_date: Date.now(),
          password: hashedPassword,
          member: false,
        });
        if (req.body.lastname) user.last_name = req.body.lastname;
        user.save((err) => {
          if (err) return next(err);
          res.redirect("/become-a-member");
        });
      });
    }
  }
);

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

module.exports = router;
