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
var url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
const dbName = "DataQuizz";
const Quizz = client.db(dbName).collection("Quizz"); // Quizz( {quizz: [[Q,[R]],...], from, like, name, date, category} )
const User = client.db(dbName).collection("User"); // User( {username, password, score} )

client.connect().then(console.log("Successful MongoDB connection"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/", async (req, res) => {
  const username = req.session.username || "Se connecter";
  let quizzData = await Quizz.find().toArray();
  res.render("mainpage.ejs", { username: username, data: quizzData });
});

app.get("/loginpage.ejs", (req, res) => {
  const username = req.session.username || "Se connecter";
  res.render("loginpage.ejs", {
    username: username,
    error_login: false,
    error_register: false,
  });
});

app.post("/loginpage.ejs", async (req, res) => {
  if (!req.body.registerUsername) {
    // user wants to login
    let user = await User.findOne({
      username: req.body.loginUsername,
      password: req.body.loginPassword,
    });
    if (user) {
      // verify user in DataBase
      req.session.username = user.username;
      let quizzData = await Quizz.find().toArray();
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
      };
      await User.insertOne(new_user);
      req.session.username = req.body.registerUsername;
      let quizzData = await Quizz.find().toArray();
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

app.get("/creationpage.ejs", (req, res) => {
  if (req.session.username) {
    // verify user connected
    const username = req.session.username || "Se connecter";
    res.render("creationpage.ejs", { username: username });
  } else {
    // if not connected, redirect to login page
    res.render("loginpage.ejs", {
      username: "Se connecter",
      error_login: false,
      error_register: false,
    });
  }
});

app.post("/creationpage.ejs", async (req, res) => {
  if (req.session.username) {
    // verify user connected
    // add new submission to DataBase
    let new_quizz = req.body.data;
    res.json({ status: "success", message: "Data received successfully" });
    await Quizz.insertOne(new_quizz);
    let quizzData = await Quizz.find().toArray();
    res.render("mainpage.ejs", {
      username: req.session.username,
      data: quizzData,
    });
  } else {
    // if not connected, redirect to login page
    res.render("loginpage.ejs", {
      username: "Se connecter",
      error_login: false,
      error_register: false,
    });
  }
});
