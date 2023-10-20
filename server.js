const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors());
const port = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY || 'YourSecretKey';

app.use(bodyParser.json());

// Dummy user data (in real-world scenarios, this would come from a database)
const users = [
  {
    id: 1,
    username: 'user1@test.com',
    password: 'password1',
  },
  {
    id: 2,
    username: 'user2@test.com',
    password: 'password2',
  },
];

// Middleware to check for a valid JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token missing.' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Access denied. Invalid token.' });
    }

    req.user = decoded;
    next();
  });
};

// Login route to authenticate and generate a JWT token
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user by username and password (insecure, just for demonstration)
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Authentication failed' });
  }

  // Create a JWT token
  const token = jwt.sign({ userId: user.id }, secretKey, {
    expiresIn: '1h', // Token expires in 1 hour
  });

  res.json({ message: 'Signed in', token });
});

// Protected route that requires a valid JWT token for access
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Logged in', user: req.user });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
