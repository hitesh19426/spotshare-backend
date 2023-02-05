const uuid = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("./../models/http-error");
const { USERS, PLACES } = require("./../DUMMY_DATA");
const Place = require("./../models/places");

const getPlaceById = (req, res, next) => {
  console.log("Get request to api/places/:placeId");
  const placeId = req.params.placeId;

  Place.findById(placeId, (err, place) => {
    if(err)
      return next(new HttpError("Place not found!!", 404));
    
    return res.json({ message: "Place Found!!", place });
  })

};

const getPlacesByUserId = (req, res, next) => {
  console.log("Get request to api/places/user/:userId");

  const userId = req.params.userId;
  const user = USERS.find((user) => user.id === userId);

  if (!user) {
    return next(new HttpError("User not found", 404));
  }

  const places = PLACES.filter((place) => place.creator === userId);
  res.json({ message: "Places Found!!", places });
};

const deletePlaceById = async (req, res, next) => {
  console.log("delete request to api/places/:placeId");
  const placeId = req.params.placeId;

    Place.findOneAndDelete({_id : placeId}, (err, result) => {
      if(err)
        return next(new HttpError("Place not found", 404));
      
      return res.json({ message: "Deleted Place!!", result });
    })
};

const updatePlaceById = (req, res, next) => {
  // console.log('patch request to api/places/:placeId');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs, please check data", 422));
  }

  // NOTE: Allowing updates to title, description, address only for now.
  const placeId = req.params.placeId;
  const { title, description, address } = req.body;

  const index = PLACES.findIndex((place) => place.id === placeId);
  if (index === -1) {
    return next(new HttpError("Place not found", 404));
  }

  const updatedPlace = { ...PLACES[index] };
  updatedPlace["title"] = title;
  updatedPlace["description"] = description;
  updatedPlace["address"] = address;

  PLACES[index] = updatedPlace;

  res.json({ message: "Updated place!!", updatedPlace });
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

  try{
    await newPlace.save()
  }catch(err){
    return next(new HttpError(err.message, 401))
  }
  
  // PLACES.push(newPlace);
  res.status(201).json({ message: "Added new place!!", newPlace: newPlace });
};

exports.getPlacesByUserId = getPlacesByUserId;
exports.getPlaceById = getPlaceById;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
exports.createPlace = createPlace;
