const uuid = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("./../models/http-error");
const { USERS, PLACES } = require("./../DUMMY_DATA");

const getListOfUsers = (req, res, next) => {
  console.log("will return a list of users");
  res.json({ message: "returned users!!", USERS });
};

const SignUpUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(errors, 404));
  }

  console.log("want to signup user");
  const { name, email, password } = req.body;

  const hasUser = USERS.find((user) => user.email === email);
  if (hasUser) {
    return next(new HttpError("User already exists", 401));
  }

  const newUser = { id: uuid.v4(), name, email, password };
  USERS.push(newUser);
  res.status(201).json({ message: "signed up user!!", user: newUser });
};

const LoginUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(errors, 404));
  }

  console.log("want to login user");
  const { email, password } = req.body;

  const user = USERS.find((user) => user.email === email);
  if (!user || password !== user.password) {
    return next(new HttpError("Wrong credentials", 401));
  }

  res.json({ message: "loged in user!!" });
};

exports.getListOfUsers = getListOfUsers;
exports.LoginUser = LoginUser;
exports.SignUpUser = SignUpUser;
