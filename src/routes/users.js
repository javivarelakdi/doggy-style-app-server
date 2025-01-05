/* eslint-disable no-underscore-dangle */
const express = require("express");
const { checkIfLoggedIn } = require("../middlewares");
const User = require("../models/user");

const router = express.Router();

// Comment out or temporarily remove this line for testing
// router.use(checkIfLoggedIn);

// return list of users
router.post("/", async (req, res, next) => {
  try {
    const { lng, lat } = req.body;
    console.log("Received coordinates:", { lng, lat });
    // Add default coordinates if not provided
    const longitude = lng || 2.154007; // Barcelona coordinates
    const latitude = lat || 41.390205;
    const users = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distance",
          spherical: true,
        },
      },
    ]);

    console.log("Found users:", users);
    res.json(users);
  } catch (error) {
    console.error("Error in /users route:", error);
    next(error);
  }
});

// update user POST action for adding favs and fans
router.post("/favs/:targetUserId", async (req, res, next) => {
  const { currentUser } = req.session;
  const { isFav } = req.body;
  const { targetUserId } = req.params;
  if (isFav === true) {
    try {
      await User.findByIdAndUpdate(
        currentUser._id,
        { $push: { favs: targetUserId } },
        { new: true }
      )
        .populate("favs")
        .populate("fans");
      const favUser = await User.findByIdAndUpdate(
        { _id: targetUserId },
        { $push: { fans: currentUser._id } },
        { new: true }
      )
        .populate("favs")
        .populate("fans");
      res.status(200).json(favUser);
    } catch (error) {
      next(error);
    }
  } else {
    try {
      await User.findByIdAndUpdate(
        currentUser._id,
        { $pull: { favs: targetUserId } },
        { new: true }
      )
        .populate("favs")
        .populate("fans");
      const favUser = await User.findByIdAndUpdate(
        { _id: targetUserId },
        { $pull: { fans: currentUser._id } },
        { new: true }
      )
        .populate("favs")
        .populate("fans");
      res.status(200).json(favUser);
    } catch (error) {
      next(error);
    }
  }
});

// shows specific user populated with fans and favs
router.get("/:id", (req, res, next) => {
  User.findById(req.params.id)
    .populate("favs")
    .populate("fans")
    .then((user) => {
      res.status(200).json(user);
    })
    .catch(next);
});

// update profile POST action
router.post("/:id", async (req, res, next) => {
  const { imgUrl, breed, birth, about, gender } = req.body;
  const { id } = req.params;
  try {
    const editedUser = await User.findByIdAndUpdate(
      id,
      { $set: { imgUrl, breed, birth, about, gender } },
      { new: true }
    );
    res.status(200).json(editedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
