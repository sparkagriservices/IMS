// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Define the Express server and its components
const app = express();
app.use(cors());
app.use(express.json());
const port = 3000;                                                                                                                                      

// Define the URI for MongoDB
const mongoURI = 'mongodb+srv://admin1:imsadmin@ims.wd9ynee.mongodb.net/User-details';

// Connect to the MongoDB database
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Define the data schema for user details
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  dob: String,
  password: String, // Store encrypted password
  confirmPass: String,
  designation: String,
  rememberMe: Boolean,
  agreeToTerms: Boolean,
  encryptionKey: String, // Store the encryption key
  iv: String, // Store the IV
});

// Define where the data has to be stored inside the database
const User = mongoose.model('users', userSchema);

// AES Encryption Function
const encryptAES = (text, key, iv) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};

// AES Decryption Function
const decryptAES = (encryptedText, key, iv) => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Secret key for JWT tokens
const jwtSecret = '7c9bd947e38e101b555d6c4ee6838ff6fb4e4f1224dab1ea8733218fb3641bf5';

// Create a JWT token for a user
const createToken = (user) => {
  return jwt.sign({ _id: user._id, email: user.email }, jwtSecret, { expiresIn: '1h' });
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Unauthorized: Invalid token' });
    }

    req.user = user;
    next();
  });
};

// Endpoint to create a new user
app.post('/newUser', async (req, res) => {
  const { firstName, lastName, username, email, dob, password, confirmPass, designation, rememberMe, agreeToTerms } = req.body;

  // Generate a random AES encryption key and IV for each user
  const encryptionKey = crypto.randomBytes(32).toString('hex'); // Convert to hex
  const iv = crypto.randomBytes(16).toString('hex'); // Convert to hex

  // Encrypt the password before saving it
  const encryptedPassword = encryptAES(password, encryptionKey, iv);

  const newUser = new User({
    firstName,
    lastName,
    username,
    email,
    dob,
    password: encryptedPassword,
    confirmPass,
    designation,
    rememberMe,
    agreeToTerms,
    encryptionKey,
    iv,
  });

  try {
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Endpoint for user authentication
app.post('/auth', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Auth Failed. User Not Found :(" });
    }

    // Decrypt the stored password for comparison using the encryption key and IV from the user
    const decryptedPassword = decryptAES(user.password, user.encryptionKey, user.iv);

    if (decryptedPassword !== password) {
      return res.status(401).json({ error: "Password Wrong" });
    }

    // Create a JWT with user information
    const token = createToken(user);

    res.json({ message: "Auth Successful :)", token, designation: user.designation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Auth failed. Check server logs for details." });
  }
});

// Endpoint to get a list of users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create a JWT refresh token for a user
const jwtRefreshSecret = '998e251982c497ab235a8980d2aaae335e8c91c7a91b087766553263758db944'; // Change this to a strong and secret key

const createRefreshToken = (user) => {
  return jwt.sign({ _id: user._id, email: user.email }, jwtRefreshSecret, { expiresIn: '7d' });
};

// Middleware to verify JWT refresh token
const verifyRefreshToken = (req, res, next) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Unauthorized: No refresh token provided' });
  }

  jwt.verify(refreshToken, jwtRefreshSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Unauthorized: Invalid refresh token' });
    }

    req.user = user;
    next();
  });
};

// Endpoint for refreshing the access token
app.post('/refreshToken', verifyRefreshToken, (req, res) => {
  const user = req.user;

  // Create a new access token for the user
  const accessToken = createToken(user);

  res.json({ accessToken });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
