const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  readCSV,
  appendCSV
} = require("../services/csvService");

const router = express.Router();

router.post("/register", async(req,res)=>{

  const {
    name,
    email,
    password
  } = req.body;

  const users =
    readCSV("./data/users.csv");

  const exists =
    users.find(u=>u.email===email);

  if(exists){

    return res.status(400).json({
      error:"User exists"
    });
  }

  const hash =
    await bcrypt.hash(password,10);

  appendCSV("./data/users.csv",{
    id:Date.now(),
    name,
    email,
    password:hash
  });

  res.json({
    success:true
  });
});

router.post("/login", async(req,res)=>{

  const {
    email,
    password
  } = req.body;

  const users =
    readCSV("./data/users.csv");

  const user =
    users.find(u=>u.email===email);

  if(!user){

    return res.status(400).json({
      error:"User not found"
    });
  }

  const match =
    await bcrypt.compare(
      password,
      user.password
    );

  if(!match){

    return res.status(400).json({
      error:"Wrong password"
    });
  }

  const token = jwt.sign(
    {
      id:user.id,
      email:user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn:"7d"
    }
  );

  res.json({
    token,
    user
  });
});

module.exports = router;