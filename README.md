# Doggy Style App Server

## Description

Backend API for Doggy Style app, which is a social network for dog owners who want to make connections with other dog owners in their neighborhoods.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcrypt (for password hashing)
- express-session (for session management)
- cors (for Cross-Origin Resource Sharing)
- dotenv (for environment variable management)

## Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- MongoDB (local installation or cloud-based service like MongoDB Atlas)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/doggy-style-backend.git
   cd doggy-style-backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   ```

### Running the Server

- For development (with nodemon):

  ```
  npm run dev
  ```

- For production:
  ```
  npm start
  ```

## API Routes

### User Routes

| Method | Path                          | Description        | Body                                    |
| ------ | ----------------------------- | ------------------ | --------------------------------------- |
| GET    | /api/users/:id                | Fetch user profile |                                         |
| GET    | /api/users/                   | Fetch users data   |                                         |
| POST   | /api/users/:id                | Update profile     | { imgUrl, breed, birth, gender, about } |
| POST   | /api/users/favs/:targetUserId | Adding favs        | { status }                              |

### Chat Routes (To be implemented)

| Method | Path           | Description        | Body                  |
| ------ | -------------- | ------------------ | --------------------- |
| GET    | /api/chats/    | Fetch chat list    |                       |
| POST   | /api/chats/new | Create chat        | { targetUserId }      |
| GET    | /api/chats/:id | Fetch 1 chat data  |                       |
| PUT    | /api/chats/:id | Update 1 chat data | { content, senderId } |

### Auth Routes

| Method | Path             | Description    | Body                                                                  |
| ------ | ---------------- | -------------- | --------------------------------------------------------------------- |
| GET    | /api/auth/whoami | Who am I       |                                                                       |
| POST   | /api/auth/signup | Signup a user  | { username, password, imgUrl, breed, birth, gender, about, lng, lat } |
| POST   | /api/auth/login  | Login a user   | { username, password, lng, lat }                                      |
| GET    | /api/auth/logout | Logout session |                                                                       |

## Models

### User Model

```javascript
{
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imgUrl: String,
  breed: String,
  birth: Date,
  about: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  gender: { type: String, enum: ['female', 'male', 'non-binary'] },
  favs: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  fans: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}
```

### Chat Room Model (To be implemented)

```javascript
{
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }]
}
```

### Chat Message Model (To be implemented)

```javascript
{
  sender: { type: Schema.Types.ObjectId, ref: "User" },
  content: String
}
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details.
