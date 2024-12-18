const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
// Multer storage configuration using diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the temporary upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Generate unique filename
  },
});
const upload = multer({ storage: storage }); // Configure Multer
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  upload.single("image"), // Multer middleware
  checkUsernameAndPasswordNotEmpty,
  async (req, res, next) => {
    const { username, password, breed, birth, gender, about, lng, lat } =
      res.locals.auth;
    let imgUrl = null;
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
        folder: "doggy-style-app",
      });
      console.log("Cloudinary upload result:", result); // Log the result
      imgUrl = result.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error); // Log the error
      return res.status(500).json({ error: "Failed to upload image" });
    }
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
        location: { type: "Point", coordinates: [lng, lat] },
      });
      req.session.currentUser = newUser;
      return res.json(newUser);
    } catch (error) {
      console.error("Error during signup:", error);
      if (error.message.includes("username")) {
        return res.status(422).json({ code: "username-not-unique" });
      }
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
          new: true,
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
  req.session.destroy((err) => {
    if (err) {
      next(err);
    }
    return res.status(204).send();
  });
});

module.exports = router;
