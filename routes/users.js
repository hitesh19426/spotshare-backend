const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const {
  getListOfUsers,
  SignUpUser,
  LoginUser,
} = require("./../controllers/users");

router.get("/", getListOfUsers);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  SignUpUser
);

router.post(
  "/login",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  LoginUser
);

module.exports = router;
