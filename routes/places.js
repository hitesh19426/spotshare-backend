const express = require("express");
const router = express.Router();
const {check} = require("express-validator");
const {getPlacesByUserId, getPlaceById, updatePlaceById, deletePlaceById, createPlace} = require("./../controllers/places")

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
    check("location").not().isEmpty(),
    check("creator").not().isEmpty(),
  ],
  createPlace
);

router.get("/user/:userId", getPlacesByUserId);

router.get("/:placeId", getPlaceById);

router.patch(
  "/:placeId",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  updatePlaceById
);

router.delete("/:placeId", deletePlaceById);

module.exports = router;
