const { validationResult } = require("express-validator");

const HttpError = require("./../models/http-error");
const { USERS } = require("./../DUMMY_DATA");
const Place = require("./../models/places");

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
  const user = USERS.find((user) => user.id === userId);

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

  try {
    const place = await Place.findByIdAndRemove(placeId);
    return res.json({ message: "Deleted Place!!", place: place.toObject() });
  } catch (err) {
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

  // console.log('post request to api/places/');
  //TODO: See if you can setup google account for location
  const { title, description, address, location, image, creator } = req.body;

  const user = USERS.find((user) => user.id === creator);
  if (!user) {
    return new HttpError("User not found", 404);
  }

  const newPlace = new Place({
    title,
    description,
    address,
    image,
    location,
    creator,
  });

  try {
    await newPlace.save();
    res.status(201).json({ message: "Added new place!!", newPlace: newPlace });
  } catch (err) {
    return next(new HttpError(err.message, 401));
  }
};

exports.getPlacesByUserId = getPlacesByUserId;
exports.getPlaceById = getPlaceById;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
exports.createPlace = createPlace;
