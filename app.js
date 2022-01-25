const session = require("express-session");
const express = require("express");
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const bodyParser = require("body-parser");
const mysql = require("mysql");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;

// Session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static Files
app.use(express.static("public"));

// Templating Engine
app.engine("hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", "hbs");

Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

// Connection Pool
const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Connect to DB
pool.getConnection((err, connection) => {
  if (err) throw err; // Not connected!
  console.log("Connected ID: " + connection.threadId);
});

// Routes
const loginroutes = require("./server/routes/login");
const userroutes = require("./server/routes/user");
app.use("/", loginroutes);
app.use("/", userroutes);

// Status 404
app.get("*", function (req, res) {
  res.redirect("/redirect");
});

app.listen(port, () => console.log(`listening on port ${port}`));
