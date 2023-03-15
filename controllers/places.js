const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const HttpError = require("./../models/http-error");
const Place = require("./../models/places");
const User = require('./../models/users')

const getPlaceById = async (req, res, next) => {
  console.log("Get request to api/places/:placeId");
  const placeId = req.params.placeId;

  try {
    const place = await Place.findById(placeId);
    res.json({ message: "Place Found!!", place: place.toObject({getters: true}) });
  } catch (err) {
    return next(new HttpError("Place not found!!", 404));
  }
};

const getPlacesByUserId = async (req, res, next) => {
  console.log("Get request to api/places/user/:userId");

  const userId = req.params.userId;
  let user;
  try{
    user = await User.findById(userId);
  }catch(err){
    return next(new HttpError('Error finding user for given ID', 401));
  }

  if (!user) {
    return next(new HttpError("User not found", 404));
  }

  try {
    const places = await Place.find({ creator: userId });
    res.json({ message: "Places Found!!", places: places.map(place => place.toObject({getters: true})) });
  } catch (err) {
    return next(new HttpError("Places not found", 404));
  }
};

const deletePlaceById = async (req, res, next) => {
  console.log("delete request to api/places/:placeId");
  const placeId = req.params.placeId;

  let place;
  try{
    place = await Place.findById(placeId).populate('creator');
  }catch(err){
    return next(new HttpError('Something went wrong', 500));
  }

  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    
    await place.remove({session});
    place.creator.places.pull(place);
    await place.creator.save({session})
    
    await session.commitTransaction();
    return res.json({ message: "Deleted Place!!", place: place.toObject() });
  } catch (err) {
    await session.abortTransaction();
    return next(new HttpError("Place not found", 404));
  }
};

const updatePlaceById = async (req, res, next) => {
  // console.log('patch request to api/places/:placeId');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs, please check data", 422));
  }

  // NOTE: Allowing updates to title, description, address only for now.
  const placeId = req.params.placeId;
  const { title, description, address } = req.body;

  try {
    const place = await Place.findByIdAndUpdate(placeId, {
      title: title,
      description: description,
      address: address,
    });
    res.json({ message: "Updated place!!", place: place.toObject({getters: true}) });
  } catch (err) {
    return next(new HttpError("Place not updated, some error occured", 404));
  }
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(errors, 404));
  }

  console.log('post request to api/places/');
  //TODO: See if you can setup google account for location
  const { title, description, address, location, image, creator } = req.body;

  let user;
  try{
    user = await User.findById(creator);
    if(!user){
      return next(new HttpError('User not found', 500));
    }
  }catch(err){
    return next(new HttpError('Error occured while checking if user exists', 401))
  }

  const newPlace = new Place({
    title,
    description,
    address,
    image,
    location,
    creator,
  });

  let session;
  try {
    // adding a session to perform transaction
    session = await mongoose.startSession();
    session.startTransaction()

    await newPlace.save({session: session});
    
    user.places.push(newPlace);
    await user.save({session: session});
    await session.commitTransaction();

    // TODO: Can remove user later
    res.status(201).json({ message: "Added new place!!", newPlace: newPlace.toObject({getters: true}), user: user.toObject({getters: true}) });
  } catch (err) {
    await session.abortTransaction();
    return next(new HttpError(err.message, 401));
  }
};

exports.getPlacesByUserId = getPlacesByUserId;
exports.getPlaceById = getPlaceById;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
exports.createPlace = createPlace;
