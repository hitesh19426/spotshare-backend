const uuid = require("uuid");
const { validationResult } = require("express-validator");
const User = require("./../models/users")

const HttpError = require("./../models/http-error");

const getListOfUsers = async (req, res, next) => {
  console.log("will return a list of users");

  try{
    const users = await User.find({}, 'name email imageUrl');
    return res.json({message: "Users Found", users: users.map(user => user.toObject({getters: true}))});
  }catch(err){
    return next(new HttpError('Error finding users. Please try again'));
  }

  // res.json({ message: "returned users!!", USERS });
};

const SignUpUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(errors, 404));
  }

  console.log("want to signup user");
  const { name, email, password, places } = req.body;

  try{
    const existingUser = await User.findOne({email: email})
    if(existingUser){
      return next(new HttpError("User already exists, login instead", 422));
    }
  }catch(err){
    return next(new HttpError("Signing up failed, try again later", 500));
  }
  
  const newUser = new User({name, email, password, places })

  try{
    await newUser.save()
    res.status(201).json({ message: "signed up user!!", user: newUser.toObject({getters: true}) });
  }catch(err){
    return next(new HttpError('Signup failed, try again', 500));
  }
  
};

const LoginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(errors, 404));
  }

  console.log("want to login user");
  const { email, password } = req.body;

  let user;
  try{
    user = await User.findOne({email: email});
  }catch(err){
    return next(new HttpError('Error occured while fetching user. Try again.', 401))
  }
  
  // const user = USERS.find((user) => user.email === email);
  user = user.toObject({getters: true});
  if (!user || password !== user.password) {
    return next(new HttpError("Wrong credentials", 401));
  }

  // TODO: Exclude password while sending response
  const requiredUser = ( ({name, email, imageUrl, places, id}) => ({name, email, imageUrl, places, id}) )(user);
  res.json({ message: "loged in user!!", user: requiredUser});
};

exports.getListOfUsers = getListOfUsers;
exports.LoginUser = LoginUser;
exports.SignUpUser = SignUpUser;
