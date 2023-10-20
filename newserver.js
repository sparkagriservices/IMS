const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const ejs = require('ejs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



const port = 3000;

const mongoURI = 'mongodb+srv://admin1:imsadmin@ims.wd9ynee.mongodb.net/User-details';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  dob: String,
  password: String,
  confirmPass: String,
  designation: String,
  rememberMe: Boolean,
  agreeToTerms: Boolean,
  encryptionKey: String,
  iv: String,
});

const User = mongoose.model('users', userSchema);

const encryptAES = (text, key, iv) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};

const decryptAES = (encryptedText, key, iv) => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const jwtSecret = '7c9bd947e38e101b555d6c4ee6838ff6fb4e4f1224dab1ea8733218fb3641bf5';

const createToken = (user) => {
  return jwt.sign({ _id: user._id, email: user.email, designation: user.designation }, jwtSecret, { expiresIn: '1h' });
};

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

app.post('/newUser', async (req, res) => {
  const { firstName, lastName, username, email, dob, password, confirmPass, designation, rememberMe, agreeToTerms } = req.body;

  const encryptionKey = crypto.randomBytes(32).toString('hex');
  const iv = crypto.randomBytes(16).toString('hex');

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
    res.render('success', { message: 'User created successfully!' });
  } catch (err) {
    res.render('error', { error: 'Failed to create user' });
  }
});

app.get('/', (req, res) => {
    res.render('landing' , {userRole : "manager"});
  });

app.get('/login' , (req , res) => {
    res.render('Sign in' )
})

app.get('/signup' , (req, res) => {
    res.render('Sign up')
})

app.get('/projects' , (req , res) => {
    res.render('projects' , {userRole : "admin"})
})

app.get('/dashboard' , (req, res) => {
    res.render('index' ,  {userRole : "admin"})
})

app.post('/auth', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('error', { error: 'Auth Failed. User Not Found :(' });
    }

    const decryptedPassword = decryptAES(user.password, user.encryptionKey, user.iv);

    if (decryptedPassword !== password) {
      return res.render('error', { error: 'Password Wrong' });
    }

    const token = createToken(user);

    res.render('success', { message: 'Auth Successful :)', token, designation: user.designation });
  } catch (err) {
    console.error(err);
    res.render('error', { error: 'Auth failed. Check server logs for details.' });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.render('userList', { users });
  } catch (err) {
    res.render('error', { error: 'Failed to fetch users' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
