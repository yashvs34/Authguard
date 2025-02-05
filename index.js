const express = require("express");
const zod = require("zod");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = express();
require('dotenv').config();
const MONGODB_URL = process.env.MONGODB_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT;

// USING MIDDLEWARES GLOBALLY
app.use(express.json());
app.use(isValidInput);
app.use(limitNumberOfRequests);

// RATE LIMITER (ALLOWING UPTO 5 REQUESTS PER SECOND PER USER)
let userVisitCount = {};

function limitNumberOfRequests (req, res, next)
{
  const userName = req.body.userName;
  
  if (userVisitCount.hasOwnProperty(userName))
  {
    if (userVisitCount[userName] > 5)
      {
        res.status(429).send("Too many requests. Please try again later!");
      }
      else
      {
        userVisitCount[userName]++;
        next();
      }
    }
    else
    {
      userVisitCount[userName] = 1;
      next();
    }
}

setInterval(() => {
  userVisitCount = {};
}, 1000);

// MIDDLEWARE TO CHECK FOR INPUT TYPE USING ZOD LIBRARY
function isValidInput (req, res, next)
{
  const schema = zod.object({
    email : zod.string().email(),
    userName : zod.string(),
    password : zod.string().min(8),
    age : zod.number()
  })
  
  const input = req.body;
  const response = schema.safeParse(input);
  const isGoodInput = response.success;
  
  if (isGoodInput)
  {
    next();
  }
  else
  {
    res.status(422).send("Invalid Input");
  }
}

// DEFINITION OF DATABASE SCHEMA AND MODEL
async function connecting ()
{ 
  await mongoose.connect();
}

connecting();
const userDB = new mongoose.Schema({
  userName : String,
  password : String,
  email : String,
  age : Number
})

const User = mongoose.model('User', userDB);

// FUNCTION FOR CREATING ACCOUNT FOR NEW USERS
async function createUser (userName, password, email, age)
{
  await User.create({
    userName,
    password,
    email,
    age
  });
}

// FUNCTION FOR CHECKING IF USER ALREADY EXITS OR NOT
async function doesExists (userName)
{
  const response = await User.findOne({userName});

  if (response === null)
  {
    return false;
  }

  return true;
}

// GET REQUEST CHECKING IF USER EXISTS, IF YES RETURNS OTHERWISE STORE IN DB
app.get('/sign-up', async (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;
  const email = req.body.email;
  const age = req.body.age;

  const userExists = await doesExists(userName);

  if (!userExists)
  {
    createUser(userName, password, email, age);

    const token = jwt.sign({userName}, JWT_SECRET);
    res.send(`This is your JWT token ${token}`);
  }
  else
  {
    res.send("User already exists. Please login!");
  }
});

// POST REQUEST CHECKING IF USER'S CREDENTIALS ARE CORRECT OR NOT
app.post('/login', (req, res) => {
  const token = req.headers.authorization;
  const password = req.headers.password;

  try
  {
    jwt.verify(token, JWT_SECRET);
    res.send("You're logged-in");
  }
  catch (exception)
  {
    res.status(401).send("Unauthorised");
  }
});

// GLOBAL CATCH
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).send("Bad request");
});

// PORT DEFINITION
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
});