const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const PORT = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.set("views", "template");

app.use(express.static(__dirname));

app.use(bodyParser.json());
// any files in the 'content' directory can be requested by clients (browsers) and will be served by the Express server
app.use(express.static("content"));
// get the inputs from the forms
app.use(express.urlencoded({ extended: false }));
// secure encrypted data
const crypto = require("crypto");
app.use(
  session({
    secret: crypto.randomBytes(20).toString("hex"),
    resave: false,
    saveUninitialized: false,
  })
);

// init MongoDB
const MongoClient = require("mongodb").MongoClient;
const { ObjectId } = require('mongodb');
var url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
const dbName = "DataQuizz";
const Quiz = client.db(dbName).collection("Quizz"); // Quiz( {quiz: [[Q,[R]],...], from, like, name, date, category} )
const User = client.db(dbName).collection("User"); // User( {username, password, score, likedQuiz: []} )

client.connect().then(console.log("Successful MongoDB connection"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


app.get("/", async (req, res) => {
  const username = req.session.username || "Se connecter";
  let quizData = await Quiz.find().toArray();
  res.render("mainpage.ejs", { username: username, data: quizData });
});


app.get("/login", (req, res) => {
  const username = req.session.username || "Se connecter";
  res.render("loginpage.ejs", {
    username: username,
    error_login: false,
    error_register: false,
  });
});

app.post("/login", async (req, res) => {
  if (!req.body.registerUsername) {
    // user wants to login
    let user = await User.findOne({
      username: req.body.loginUsername,
      password: req.body.loginPassword,
    });
    if (user) {
      // verify user in DataBase
      req.session.username = user.username;
      let quizzData = await Quiz.find().toArray();
      res.render("mainpage.ejs", {
        username: req.session.username,
        data: quizzData,
      });
    } else {
      const username = req.session.username || "Se connecter";
      res.render("loginpage.ejs", {
        username: username,
        error_login: true,
        error_register: false,
      });
    }
  } else {
    // user wants to register
    // add new user to the database
    let verify_username = await User.findOne({
      username: req.body.registerUsername,
    });
    if (!verify_username) {
      // verify if username is not already used
      let new_user = {
        username: req.body.registerUsername,
        password: req.body.registerPassword,
        score: 0,
        likedQuiz: [],
      };
      await User.insertOne(new_user);
      req.session.username = req.body.registerUsername;
      let quizzData = await Quiz.find().toArray();
      res.render("mainpage.ejs", {
        username: req.session.username,
        data: quizzData,
      });
    } else {
      // if username is already used
      const username = req.session.username || "Se connecter";
      res.render("loginpage.ejs", {
        username: username,
        error_login: false,
        error_register: true,
      });
    }
  }
});


app.get("/creation", (req, res) => {
  if (req.session.username) {
    // verify user connected
    const username = req.session.username || "Se connecter";
    res.render("creationpage.ejs", { username: username });
  } else {
    // if not connected, redirect to login page
    res.redirect("/login");
  }
});

app.post("/creation", async (req, res) => {
  if (req.session.username) { // verify user connected
    // add new submission to DataBase
    let new_quizz = req.body.data;
    res.json({ status: "success", message: "Data received successfully" });
    await Quiz.insertOne(new_quizz);
  } else {
    // if not connected, redirect to login page
    res.redirect("/login");
  }
});


app.get("/classement", (req, res) => {
  const username = req.session.username || "Se connecter";
  res.render("classement.ejs", {
    username: username,
    error_login: false,
    error_register: false,
  });
});


app.get("/play", async (req, res) => {  
  const username = req.session.username || "Se connecter";
  if (req.session.quiz) {
    res.render("play.ejs", {
      username: username,
      quiz: req.session.quiz
    });
  } else {
    res.redirect("/");
  };
});

app.post("/play", async (req, res) => {
  let quiz = await Quiz.findOne({ _id: new ObjectId(req.body.quizId) });
  req.session.quiz = quiz;
  res.json({ status: "success", message: "Data received successfully" });
});

app.post("/like", async (req, res) => {
  const quizId = new ObjectId(req.body.quizId);

  if (!req.session.username) {
    return res.status(404).json({ status: "error", message: "User not found" });
  };

  // Check if the quiz is already liked by the user
  const user = await User.findOne({ username: req.session.username, likedQuiz: quizId });

  if (user) {
    // If the quiz is already liked, unlike it
    await User.findOneAndUpdate(
      {username: req.session.username}, 
      { $pull: { likedQuiz: quizId } }
    );

    // Use $inc to decrement the like count
    await Quiz.findOneAndUpdate(
      { _id: quizId },
      { $inc: { like: -1 } }, // Decrement like by 1
    );

    res.json({ status: "success", message: "Quiz unliked successfully" });
  } else {
    // If the quiz is not liked, like it
    await User.findOneAndUpdate({username: req.session.username}, { $push: { likedQuiz: quizId } });

    // Use $inc to increment the like count
    await Quiz.findOneAndUpdate(
      { _id: quizId },
      { $inc: { like: 1 } }, // Increment like by 1
    );

    res.json({ status: "success", message: "Quiz liked successfully" });
  }
});
