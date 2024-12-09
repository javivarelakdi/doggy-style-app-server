require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");

const sampleUsers = [
  {
    username: "Luna",
    password: "hashedPassword123", // In production, ensure passwords are properly hashed
    imgUrl: "https://example.com/luna.jpg",
    breed: "Golden Retriever",
    birth: new Date("2022-01-15"),
    about: "Playful and energetic Golden Retriever looking for friends",
    location: {
      type: "Point",
      coordinates: [2.154007, 41.390205], // Barcelona coordinates
    },
    gender: "female",
  },
  {
    username: "Max",
    password: "hashedPassword456",
    imgUrl: "https://example.com/max.jpg",
    breed: "German Shepherd",
    birth: new Date("2021-06-20"),
    about: "Athletic German Shepherd who loves running",
    location: {
      type: "Point",
      coordinates: [2.168365, 41.387097],
    },
    gender: "male",
  },
  {
    username: "Bella",
    password: "hashedPassword789",
    imgUrl: "https://example.com/bella.jpg",
    breed: "French Bulldog",
    birth: new Date("2023-03-10"),
    about: "Friendly Frenchie seeking playmates",
    location: {
      type: "Point",
      coordinates: [2.149027, 41.379909],
    },
    gender: "female",
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users");

    // Insert sample users
    const createdUsers = await User.create(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Add some favs and fans relationships
    const [luna, max, bella] = createdUsers;

    // Luna likes Max and Bella
    await User.findByIdAndUpdate(luna._id, {
      $push: { favs: [max._id, bella._id] },
    });

    // Max and Bella are fans of Luna
    await User.findByIdAndUpdate(max._id, {
      $push: { fans: luna._id },
    });
    await User.findByIdAndUpdate(bella._id, {
      $push: { fans: luna._id },
    });

    console.log("Added relationships between users");

    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
