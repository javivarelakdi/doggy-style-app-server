/* eslint-disable no-underscore-dangle */
const express = require("express");
const bcrypt = require("bcrypt");

const { checkUsernameAndPasswordNotEmpty } = require("../middlewares");

const User = require("../models/user");

const bcryptSalt = 10;

const router = express.Router();

router.get("/whoami", (req, res, next) => {
  if (req.session.currentUser) {
    res.status(200).json(req.session.currentUser);
  } else {
    res.status(401).json({ code: "unauthorized" });
  }
});

router.post(
  "/signup",
  checkUsernameAndPasswordNotEmpty,
  async (req, res, next) => {
    const {
      username,
      password,
      imgUrl,
      breed,
      birth,
      gender,
      about,
      lng,
      lat
    } = res.locals.auth;
    try {
      const user = await User.findOne({ username });
      if (user) {
        return res.status(422).json({ code: "username-not-unique" });
      }
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const newUser = await User.create({
        username,
        password: hashedPassword,
        imgUrl,
        breed,
        birth,
        gender,
        about,
        location: { type: "Point", coordinates: [lng, lat] }
      });
      req.session.currentUser = newUser;
      return res.json(newUser);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  checkUsernameAndPasswordNotEmpty,
  async (req, res, next) => {
    const { username, password, lng, lat } = res.locals.auth;
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ code: "not-found" });
      }
      if (bcrypt.compareSync(password, user.password)) {
        const filter = { _id: user._id };
        const update = { location: { type: "Point", coordinates: [lng, lat] } };
        const userUpdated = await User.findByIdAndUpdate(filter, update, {
          new: true
        });
        req.session.currentUser = userUpdated;
        return res.status(200).json(userUpdated);
      }
    } catch (error) {
      next(error);
    }
  }
);

router.get("/logout", (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      next(err);
    }
    return res.status(204).send();
  });
});

module.exports = router;
